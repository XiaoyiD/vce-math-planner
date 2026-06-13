import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.services.planner import generate_lesson_plan

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

UNITS = [
    "Unit 1: General Mathematics",
    "Unit 2: General Mathematics",
    "Units 3 and 4: General Mathematics",
]


class PlanRequest(BaseModel):
    unit: str
    topic: str
    subtopic: str = ""
    duration_mins: int = 60
    student_level: str = "mixed"
    textbook: str = ""
    extra: str = ""


class RefineRequest(BaseModel):
    unit: str
    topic: str
    subtopic: str = ""
    duration_mins: int
    student_level: str
    textbook: str = ""
    extra: str
    instruction: str


@router.get("/units")
def get_units():
    return {"units": UNITS}


@router.post("/generate")
@limiter.limit("10/day")
def generate(request: Request, req: PlanRequest):
    def stream():
        for chunk in generate_lesson_plan(
            req.unit, req.topic, req.subtopic, req.duration_mins, req.student_level, req.textbook, req.extra
        ):
            yield chunk

    return StreamingResponse(stream(), media_type="text/plain")


MOCK_PLAN = """### 1. Lesson Background
- Year Level: VCE Year 11
- Subject/Topic: General Mathematics – Matrices
- Duration: 60 minutes
- Victorian Curriculum Link: Use of matrices to store and display information; matrix operations including addition, subtraction and multiplication (VCAA General Mathematics Unit 1, Area of Study 4)

### 2. Learning Intentions & Success Criteria (LI/SC)
- Learning Intention (LI): We are learning to use matrix multiplication to solve practical problems.
- Success Criteria (SC):
  - I can identify the order of a matrix and determine if two matrices can be multiplied.
  - I can perform matrix multiplication by hand for 2x2 and 2x3 matrices.
  - I can apply matrix multiplication to model a real-world situation such as a stock inventory problem.

### 3. Differentiation (Monash Key Focus)
- Enabling Prompts (Support): Provide a step-by-step scaffold card showing the row-by-column rule with colour coding. Use only 2x2 matrices with whole numbers. Allow students to refer to a completed example.
- Extension Prompts (Challenge): Ask students to create their own matrix word problem and swap with a partner. Introduce the concept of non-commutativity (AB does not equal BA) and ask students to find a counterexample.

### 4. Lesson Procedure (Timing & Structure)
- Introduction (8 mins): Show a supermarket shelf restocking scenario on the board. "A store sells 3 products across 2 branches. How do we track sales efficiently?" Introduce matrices as a tool. Share LI/SC with the class and ask students to read them aloud.
- Body (42 mins):
  - I Do (Explicit Teaching): Model matrix multiplication step-by-step using the stock example. Narrate thinking aloud: "I multiply row 1 of matrix A by column 1 of matrix B and add the products." Repeat with a second example.
  - We Do (Collaborative): Pairs complete a guided worksheet with 3 matrix multiplication problems of increasing size (2x2, 2x3, 3x2). Partners check each other's work and discuss errors.
  - You Do (Independent): Students independently solve a 4-question set: Q1-2 procedural, Q3 a worded problem, Q4 open-ended (design your own scenario).
- Conclusion (10 mins): Class discussion — "Where else might matrices be useful?" Students complete Exit Ticket individually before leaving.

### 5. Resources & Assessment
- Resources: Whiteboard for modelling, guided worksheet (printed), CAS calculator (for checking larger multiplications), colour-coded scaffold cards for enabling students.
- Assessment For Learning: Exit Ticket — "Two matrices are given: A = [[2,1],[3,4]] and B = [[1,0],[2,3]]. Calculate AB and state the order of the result." Teacher circulates during You Do phase and notes common errors for next lesson's warm-up.
"""


@router.post("/mock")
async def mock_generate(request: Request, req: PlanRequest):
    async def stream():
        for char in MOCK_PLAN:
            yield char
            await asyncio.sleep(0.005)

    return StreamingResponse(stream(), media_type="text/plain")


@router.post("/refine")
@limiter.limit("20/day")
def refine(request: Request, req: RefineRequest):
    combined_extra = f"{req.extra}\n\nTeacher refinement request: {req.instruction}".strip()

    def stream():
        for chunk in generate_lesson_plan(
            req.unit, req.topic, req.subtopic, req.duration_mins, req.student_level, req.textbook, combined_extra
        ):
            yield chunk

    return StreamingResponse(stream(), media_type="text/plain")
