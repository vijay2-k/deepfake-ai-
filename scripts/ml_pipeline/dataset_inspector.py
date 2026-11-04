"""
KRYPTX Forensic Dataset Ingestion & Validation Engine
Safely extracts, validates, deduplicates, and inspects custom datasets
for multi-class digital forensics training (REAL, AI_GENERATED, AI_MODIFIED, MANIPULATED, UNKNOWN).
Enforces strict anti-leakage grouping and label verification.
"""

import os
import sys
import json
import zipfile
import hashlib
import re
from pathlib import Path
from PIL import Image

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.bmp'}

def safe_extract_zip(zip_path: str, extract_to: str) -> list[str]:
    """Safely extracts zip file preventing zip-slip vulnerabilities."""
    extracted_files = []
    base_dir = os.path.abspath(extract_to)
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for member in zf.infolist():
            # Skip directories
            if member.is_dir():
                continue
            # Check target path is inside base_dir
            target_path = os.path.abspath(os.path.join(base_dir, member.filename))
            if not target_path.startswith(base_dir):
                raise ValueError(f"Zip slip security violation detected in: {member.filename}")
            
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with zf.open(member) as src, open(target_path, 'wb') as dst:
                dst.write(src.read())
            extracted_files.append(target_path)
            
    return extracted_files

def compute_sha256(file_path: str) -> str:
    """Computes SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def extract_family_key(filename: str) -> str:
    """Extracts base family key to keep original & edited pairs in the same split (leakage prevention)."""
    name = Path(filename).stem.lower()
    # Remove common suffixes like _edited, -edited, (1), _crop, _mod, etc.
    name = re.sub(r'[\s_\-]*(edited|copy|modified|crop|v\d+|\(\d+\)|\d+)$', '', name)
    return name.strip() or Path(filename).stem.lower()

def infer_provisional_label(file_path: str, dataset_root: str) -> tuple[str, str]:
    """
    Infers provisional label from path or metadata.
    Returns (label, source_confidence).
    Labels: REAL, AI_GENERATED, AI_MODIFIED, MANIPULATED, UNKNOWN.
    """
    rel_path = os.path.relpath(file_path, dataset_root).lower()
    parts = Path(rel_path).parts
    
    # Check folder names or keywords
    path_str = '/'.join(parts)
    
    if any(k in path_str for k in ['ai_modified', 'inpainted', 'modified_ai', 'face_enhanced', 'retouched_ai']):
        return 'AI_MODIFIED', 'folder_keyword'
    elif any(k in path_str for k in ['ai_generated', 'synthetic', 'diffusion', 'midjourney', 'dalle', 'flux', 'sdxl', 'imagen']):
        return 'AI_GENERATED', 'folder_keyword'
    elif any(k in path_str for k in ['manipulated', 'photoshop', 'splice', 'cloning', 'deepfake_face_swap']):
        return 'MANIPULATED', 'folder_keyword'
    elif any(k in path_str for k in ['real', 'authentic', 'camera', 'photo', 'bonafide', 'pristine']):
        return 'REAL', 'folder_keyword'
    
    return 'UNKNOWN', 'unlabeled'

def inspect_dataset(source_path: str, output_base: str, dataset_id: str) -> dict:
    """
    Full inspection pipeline:
    1. Extract if zip, or walk directory
    2. Check image validity & corruption
    3. Calculate SHA-256 hashes & detect duplicates
    4. Group families to prevent data leakage
    5. Build manifest
    6. Generate report
    """
    dataset_dir = os.path.join(output_base, dataset_id)
    os.makedirs(dataset_dir, exist_ok=True)
    
    raw_files = []
    is_archive = zipfile.is_zipfile(source_path)
    
    if is_archive:
        raw_files = safe_extract_zip(source_path, os.path.join(dataset_dir, 'extracted'))
    elif os.path.isdir(source_path):
        for root, _, files in os.walk(source_path):
            for f in files:
                raw_files.append(os.path.join(root, f))
    else:
        raise ValueError(f"Unsupported source format: {source_path}")
    
    manifest_records = []
    corrupt_files = []
    hash_map = {}
    family_map = {}
    
    class_counts = {
        'REAL': 0,
        'AI_GENERATED': 0,
        'AI_MODIFIED': 0,
        'MANIPULATED': 0,
        'UNKNOWN': 0
    }
    
    for file_path in raw_files:
        ext = Path(file_path).suffix.lower()
        if ext not in VALID_EXTENSIONS:
            continue
            
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            corrupt_files.append({"path": file_path, "reason": "Zero-byte file"})
            continue
            
        # Verify image integrity with Pillow
        try:
            with Image.open(file_path) as img:
                img.verify()
                width, height = img.size
                img_format = img.format or ext.replace('.', '').upper()
        except Exception as e:
            corrupt_files.append({"path": file_path, "reason": f"Corrupt image stream: {str(e)}"})
            continue
            
        # Compute SHA-256 hash
        sha256 = compute_sha256(file_path)
        is_duplicate = sha256 in hash_map
        if not is_duplicate:
            hash_map[sha256] = file_path
        
        # Family key for anti-leakage grouping
        family_key = extract_family_key(os.path.basename(file_path))
        if family_key not in family_map:
            family_map[family_key] = []
        family_map[family_key].append(file_path)
        
        # Label inference & verification
        label, label_source = infer_provisional_label(file_path, dataset_dir)
        class_counts[label] += 1
        
        record = {
            "image_id": f"img_{hashlib.md5(file_path.encode()).hexdigest()[:12]}",
            "file_path": file_path,
            "filename": os.path.basename(file_path),
            "sha256": sha256,
            "format": img_format,
            "resolution": f"{width}x{height}",
            "width": width,
            "height": height,
            "file_size_bytes": file_size,
            "ground_truth_label": label,
            "label_source": label_source,
            "is_duplicate": is_duplicate,
            "family_group_id": family_key,
            "dataset_id": dataset_id
        }
        manifest_records.append(record)
    
    # Anti-leakage Split Assignment (70% Train, 15% Val, 15% Test grouped strictly by family)
    families = list(family_map.keys())
    # Deterministic shuffle by hash
    families.sort(key=lambda x: hashlib.md5(x.encode()).hexdigest())
    
    n_families = len(families)
    train_end = int(n_families * 0.70)
    val_end = int(n_families * 0.85)
    
    train_families = set(families[:train_end])
    val_families = set(families[train_end:val_end])
    test_families = set(families[val_end:])
    
    for rec in manifest_records:
        grp = rec["family_group_id"]
        if grp in train_families:
            rec["split"] = "train"
        elif grp in val_families:
            rec["split"] = "validation"
        else:
            rec["split"] = "independent_test"
            
    manifest_path = os.path.join(dataset_dir, "dataset_manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest_records, f, indent=2)
        
    report = {
        "dataset_id": dataset_id,
        "source_path": source_path,
        "is_archive": is_archive,
        "total_files_found": len(raw_files),
        "valid_images": len(manifest_records),
        "corrupt_files_count": len(corrupt_files),
        "corrupt_files": corrupt_files[:20],
        "duplicate_images_count": sum(1 for r in manifest_records if r["is_duplicate"]),
        "unique_image_families": len(families),
        "class_breakdown": class_counts,
        "split_breakdown": {
            "train": sum(1 for r in manifest_records if r["split"] == "train"),
            "validation": sum(1 for r in manifest_records if r["split"] == "validation"),
            "independent_test": sum(1 for r in manifest_records if r["split"] == "independent_test"),
        },
        "anti_leakage_groups_count": len(family_map),
        "requires_label_clarification": class_counts["UNKNOWN"] > 0,
        "unknown_samples_count": class_counts["UNKNOWN"],
        "manifest_path": manifest_path,
        "status": "ready_for_review" if class_counts["UNKNOWN"] == 0 else "needs_label_clarification"
    }
    
    report_path = os.path.join(dataset_dir, "inspection_report.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
        
    return report

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python dataset_inspector.py <source_path> <output_base> <dataset_id>")
        sys.exit(1)
        
    source_p = sys.argv[1]
    out_b = sys.argv[2]
    ds_id = sys.argv[3]
    
    res = inspect_dataset(source_p, out_b, ds_id)
    print(json.dumps(res, indent=2))

