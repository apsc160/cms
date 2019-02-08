# Statement types

STATEMENT_TYPE_PDF = "pdf"
STATEMENT_TYPE_MD = "md"
STATEMENT_TYPE_HTML = "html"

def get_statement_type(statement_file):
    if statement_file.endswith(".pdf"):
        return STATEMENT_TYPE_PDF
    elif statement_file.endswith(".html"):
        return STATEMENT_TYPE_HTML
    elif statement_file.endswith(".md"):
        return STATEMENT_TYPE_MD
    else:
        return None