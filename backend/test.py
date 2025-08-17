from app.utils.tools import summarize_text

sample_resume = """
Name: Mahnoor Irfan
Email: mahnoor@example.com
Education: BS Computer Science
Experience: Intern at Techlogix
Skills: Python, React, Java
"""

summary = summarize_text(sample_resume)
print(summary)
