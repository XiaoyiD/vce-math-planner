"""
Parse and index the VCAA General Mathematics Study Design docx into ChromaDB.
Run once: python -m app.services.ingest
"""

import re
from pathlib import Path
from docx import Document
import chromadb

DOCX_PATH = Path(__file__).parents[2] / "data" / "2023MathematicsSD.docx"
CHROMA_PATH = Path(__file__).parents[2] / "chroma_db"

GENERAL_MATH_START_KEYWORDS = [
    "Unit 1: General Mathematics",
    "Unit 2: General Mathematics",
    "Units 3 and 4: General Mathematics",
]

HEADING_STYLES = {
    "VCAA Heading 1": 1,
    "VCAA Heading 2": 2,
    "VCAA Heading 3": 3,
    "VCAA Heading 4": 4,
    "VCAA Heading 5": 5,
}


def extract_general_math_chunks(docx_path: Path) -> list[dict]:
    doc = Document(docx_path)
    paras = doc.paragraphs

    # Find paragraph indices for General Math units
    unit_starts = []
    for i, p in enumerate(paras):
        if p.text.strip() in GENERAL_MATH_START_KEYWORDS:
            unit_starts.append(i)

    if not unit_starts:
        raise ValueError("Could not find General Mathematics sections in document")

    # Collect all General Math paragraphs (from first unit start to end of last unit)
    # End is either next Heading 1 that is NOT General Math, or end of doc
    def find_section_end(start_idx: int, next_unit_start: int | None) -> int:
        if next_unit_start is not None:
            return next_unit_start
        # Find next Heading 1 that is not General Math
        for i in range(start_idx + 1, len(paras)):
            p = paras[i]
            if p.style.name == "VCAA Heading 1" and "General Mathematics" not in p.text:
                return i
        return len(paras)

    chunks = []

    for unit_idx, start in enumerate(unit_starts):
        end = find_section_end(
            start,
            unit_starts[unit_idx + 1] if unit_idx + 1 < len(unit_starts) else None,
        )

        unit_name = paras[start].text.strip()
        current_headings = {1: unit_name, 2: "", 3: "", 4: "", 5: ""}
        buffer_lines = []
        buffer_meta = {"unit": unit_name, "area": "", "topic": "", "section": ""}

        def flush_chunk():
            text = "\n".join(buffer_lines).strip()
            if len(text) > 80:
                chunks.append(
                    {
                        "text": text,
                        "unit": buffer_meta["unit"],
                        "area": buffer_meta["area"],
                        "topic": buffer_meta["topic"],
                        "section": buffer_meta["section"],
                        "id": f"{buffer_meta['unit']}|{buffer_meta['area']}|{buffer_meta['topic']}|{buffer_meta['section']}|{len(chunks)}",
                    }
                )

        for i in range(start, end):
            p = paras[i]
            text = p.text.strip()
            if not text:
                continue

            style = p.style.name
            level = HEADING_STYLES.get(style)

            if level is not None:
                flush_chunk()
                buffer_lines = [text]
                current_headings[level] = text
                # Clear sub-headings
                for l in range(level + 1, 6):
                    current_headings[l] = ""

                buffer_meta = {
                    "unit": current_headings[1],
                    "area": current_headings[2] or current_headings[3],
                    "topic": current_headings[4],
                    "section": current_headings[5],
                }
            else:
                if style == "VCAA bullet":
                    buffer_lines.append(f"• {text}")
                else:
                    buffer_lines.append(text)

        flush_chunk()

    return chunks


def build_index(chunks: list[dict]):
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))

    # Drop and recreate collection for clean re-index
    try:
        client.delete_collection("vce_general_math")
    except Exception:
        pass

    collection = client.create_collection(
        "vce_general_math",
        metadata={"hnsw:space": "cosine"},
    )

    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        collection.add(
            ids=[c["id"] for c in batch],
            documents=[c["text"] for c in batch],
            metadatas=[
                {
                    "unit": c["unit"],
                    "area": c["area"],
                    "topic": c["topic"],
                    "section": c["section"],
                }
                for c in batch
            ],
        )

    print(f"Indexed {len(chunks)} chunks into ChromaDB")
    return collection


def main():
    print("Parsing docx...")
    chunks = extract_general_math_chunks(DOCX_PATH)
    print(f"Extracted {len(chunks)} chunks from General Mathematics sections")

    for c in chunks[:3]:
        print(f"\n--- {c['unit']} / {c['area']} / {c['topic']} ---")
        print(c["text"][:200])

    print("\nBuilding ChromaDB index...")
    build_index(chunks)
    print("Done.")


if __name__ == "__main__":
    main()
