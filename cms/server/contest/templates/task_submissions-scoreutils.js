{# Utilities used for scoring
 # Requires: SubmissionResult
 #}
   
    
function is_status_terminal (status) {
    return status == {{ SubmissionResult.COMPILATION_FAILED }}
        || status == {{ SubmissionResult.SCORED }};
};

function get_score_class (score, max_score) {
    if (score <= 0) {
        return "score_0";
    } else if (score >= max_score) {
        return "score_100";
    } else {
        return "score_0_100";
    }
};