{# Shows previous submission details
 # Requires: tokens_contest, tokens_task
 # Depends: task_submissions-scoreutils.js
 #}

 {% set can_use_tokens = tokens_contest != TOKEN_MODE_DISABLED and tokens_task != TOKEN_MODE_DISABLED %}
    
// modal submission status view
$(document).on("click", ".submission_list tbody tr td.status .details", function (event) {
    var submission_id = $(this).parent().parent().attr("data-submission");
    var modal = $("#submission_detail");
    var modal_body = modal.children(".modal-body");
    modal_body.html('<div class="loading"><img src="{{ url("static", "loading.gif") }}"/>{% trans %}loading...{% endtrans %}</div>');
    modal_body.load(utils.contest_url("tasks", "{{ task.name }}", "submissions", submission_id, "details"), function() {
        $(".score_details .subtask .subtask-head").each(function () {
            $(this).prepend("<i class=\"icon-chevron-right\"></i>");
        });
        $(".score_details .subtask .subtask-head").click(function () {
            $(this).parent().toggleClass("open");
            if ($(this).parent().hasClass("open")) {
                $(this).children("i").removeClass("icon-chevron-right").addClass("icon-chevron-down");
            } else {
                $(this).children("i").removeClass("icon-chevron-down").addClass("icon-chevron-right");
            }
        });
        $(".score_details table.testcase-list").addClass("table table-bordered table-striped");
        $(".score_details table.testcase-list tbody tr:not(.undefined) td.outcome").each(function () {
            $(this).html("<span class=\"outcome\">" + $(this).text() + "</span>");
        });
    });
    modal.modal("show");
});

// scoring
/**
 * Update the submission row score (public or tokened) in the UI 
 * given the results of a newly scored submisson
 *
 * score_elem: table cell with the submission score to update.
 * score (Number): the score of the submission.
 * score_message (String): the score of the submission as a string.
 * max_score (Number): maximum score of the task.
 */
update_submission_score = function(score_elem, score, score_message, max_score) {
    // Submission row.
    if (score !== undefined) {
        score_elem.addClass(get_score_class(score, max_score));
        score_elem.removeClass("undefined");
        score_elem.text(score_message);
    }
};

update_submission_scores = function (submission_id, data) {
    var row = $(".submission_list tbody tr[data-submission=\"" + submission_id + "\"]");
    row.attr("data-status", data["status"]);
    row.children("td.status").text(data["status_text"]);
    var terminal_status = is_status_terminal(data["status"]);
    if (!terminal_status) {
        row.children("td.status").append(
            $("<img class=\"details\" src=\"{{ url("static", "loading.gif") }}\"/>"));
    } else {
        row.children("td.status").append(
            $("<a class=\"details\">{% trans %}details{% endtrans %}</a>"));
    }

    if (terminal_status) {
        update_submission_score(
            row.children("td.public_score"), data["public_score"], 
            data["public_score_message"], data["max_public_score"]);
{% if can_use_tokens %}
        update_submission_score(
            row.children("td.total_score"), data["score"], 
            data["score_message"], data["max_score"]);
{% endif %}
    } else {
        schedule_update_submission_scores(submission_id);
    }
};

schedule_update_submission_scores = function (submission_id) {
    if (typeof(schedule_update_submission_scores.delays) === "undefined") {
        schedule_update_submission_scores.delays = {};
    }
    if (!schedule_update_submission_scores.delays[submission_id]) {
        schedule_update_submission_scores.delays[submission_id] = 1000.0;
    } else {
        // We want exponential backoff, but slightly staggered across submissions to
        // avoid asking about all of them at the same time, so we use 1.4 plus a
        // value depending on the submission id.
        var hash = (37 * parseInt(submission_id)) % 100 / 100.0;
        schedule_update_submission_scores.delays[submission_id] =
            schedule_update_submission_scores.delays[submission_id]
                * (1.4 + hash * 0.2);
    }
    setTimeout(function () {
        $.get(utils.contest_url("tasks", "{{ task.name }}", "submissions", submission_id), function (data) {
            update_submission_scores(submission_id, data);
        });
    }, schedule_update_submission_scores.delays[submission_id]);
};

$(document).ready(function () {
    $('.submission_list tbody tr[data-status][data-status!="{{ SubmissionResult.COMPILATION_FAILED }}"][data-status!="{{ SubmissionResult.SCORED }}"]').each(
        function (idx, elem) {
            schedule_update_submission_scores($(this).attr("data-submission"));
        }
    );
});