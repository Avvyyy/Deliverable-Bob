# Deliverable Bob
Are you messy with deadlines like me? Bob is here to keep you organised

## Overview
Students often miss deadlines because information is scattered across different sources (PDFs, chats, emails, etc.).

**Bob**:
- Ingests messy academic content
- Extracts deadlines automatically
- Normalizes and stores them
- Presents a clean, reliable timeline
- Notifies users intelligently

## Core Features
1. Data Ingestion
Bob accepts:
Plain text (e.g. copied chat messages)
PDF documents
(Optional) JSON or structured input
and handles:
- messy/unstructured data
- stores raw input for traceability
2. Deadline Extraction Engine
Bob extracts:
- Task name
- Deadline (date + time if available)
- Source (e.g. “Math Assignment PDF”, “WhatsApp message”)
Using:
- Rules, regex, or LLMs (or hybrid)

Bob:
- Validates extracted data
- Handles ambiguous phrases (e.g. “next Friday”)
- Assigns a confidence score to each extraction
3. Date Normalization
Bob converts all extracted dates into a standard format (e.g. ISO timestamp).
Examples:
“tomorrow”
“next week Monday”
“April 5th by 2pm”
4. Storage Design
Bob uses a database to store:
- Tasks
- Sources
- Raw input
- Confidence scores
Bob:
- Handles duplicates (same task from multiple sources)
5. Timeline & Conflict Detection
Bob provides:
- View all deadlines in a unified timeline
- Detects:
- Overlapping deadlines
- High-risk days (multiple deadlines close together)
6. Notification System
Bob implements a reminder system that:
- Notifies users before deadlines
- Avoids duplicate or spammy alerts
- Supports configurable timing (e.g. 1 day before, 2 hours before)
7. Backend System
Bob has:
- APIs for ingestion and retrieval
- Asynchronous processing for extraction (queue/worker system)
Bob:
- Does not block on heavy processing
- Is able to re-process data if needed
8. Frontend (Minimal but Functional)
Bob has:
- Input interface (upload/paste data)
- Timeline view
- Task list

9. DevOps Requirements
Bob is dockerized:
- Provides a working docker compose setup
- Separate services where appropriate (API, worker, DB)
10. Security & Robustness
Bob:
- Validates all inputs (files, text)
- Handles malformed or unexpected data gracefully
- Prevents system crashes from bad input
11. Semantic Search (Optional)
Bob can use Chroma DB to:
- Search tasks by meaning (e.g. “all AI assignments”)

6. Notification System
Bob implements a reminder system that:
- Notifies users before deadlines
- Avoids duplicate or spammy alerts
- Supports configurable timing (e.g. 1 day before, 2 hours before)
7. Backend System
Bob has:
- APIs for ingestion and retrieval
- Asynchronous processing for extraction (queue/worker system)
Bob:
- Does not block on heavy processing
- Is able to re-process data if needed
8. Frontend (Minimal but Functional)
Bob has:
- Input interface (upload/paste data)
- Timeline view
- Task list
No need for design polish. Focus on usability.
9. DevOps Requirements
Bob is dockerized:
- Provides a working docker compose setup
- Separate services where appropriate (API, worker, DB)
10. Security & Robustness
Bob:
- Validates all inputs (files, text)
- Handles malformed or unexpected data gracefully
- Prevents system crashes from bad input
11. Semantic Search (Optional)
Bob can use Chroma DB to:
- Search tasks by meaning (e.g. “all AI assignments”)
If implemented, Bob must explain:
- Why it improves the system
- When it is useful vs unnecessary

Constraints
- Bob must handle at least 50 mixed input
- Extraction must include confidence scoring
- Bob must handle duplicate/conflicting deadlines
- System must use asynchronous processing

Deliverables
- Gitlab Repository
- README including:
    - Architecture overview
    - Data flow
    - Trade-offs
    - Known limitations
- Demo Video (5–10 minutes)