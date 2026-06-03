import os
import httpx
from fastapi import HTTPException, status


AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001")


def analyse_cv_with_ai(texte_extrait: str) -> dict:
    try:
        response = httpx.post(
            f"{AI_SERVICE_URL}/analyse-cv/",
            json={"texte_extrait": texte_extrait},
            timeout=60
        )

        response.raise_for_status()
        return response.json()

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service IA indisponible"
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur du service IA: {e.response.text}"
        )
    

def calculate_matching_score_with_ai(
    competences: str,
    competences_offre: str,
    job_role: str,
    experience: int,
    education: str,
    langues: str
) -> dict:
    try:
        response = httpx.post(
            f"{AI_SERVICE_URL}/matching/score",
            json={
                "competences": competences,
                "competences_offre": competences_offre,
                "job_role": job_role,
                "experience": experience,
                "education": education,
                "langues": langues
            },
            timeout=60
        )

        response.raise_for_status()
        return response.json()

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service IA indisponible"
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur du service IA Matching: {e.response.text}"
        )