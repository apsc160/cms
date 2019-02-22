{# Updates task score element
 # Requires: task, tokens_contest, tokens_task, submissions
 # Depends: task_submissions-scoreutils.js
 #}

{% set score_type = get_score_type(dataset=task.active_dataset) %}
{% set can_use_tokens = tokens_contest != TOKEN_MODE_DISABLED and tokens_task != TOKEN_MODE_DISABLED %}

{% set submission_table_submissions = submissions|selectattr("official")|list %}
var official_submission_ids = [
{% for s in submission_table_submissions|sort(attribute="timestamp")|reverse %}
    {{ loop.index0 + 1 }},
{% endfor %}
];

/**
 * Update the task score (public or tokened) in the UI given the results 
 * of a newly scored submisson
 *
 * task_score_elem: container element of the task score to update.
 * task_score (Number): the current score of the task.
 * task_score_message (String): the current score of the task as a string.
 * task_score_is_partial (Boolean): if some submission has yet to be scored.
 * max_score (Number): maximum score of the task.
 */
update_task_score = function(task_score_elem,
    task_score, task_score_message, task_score_is_partial,
    max_score) {

    if (typeof(max_score) === "undefined") {
        max_score = {{ score_type.max_score if score_type is defined else 0 }};
    }
        
    // Task score.
    var task_score_span = task_score_elem.find(".score");
    task_score_span.text(task_score_message);
    if (task_score_is_partial) {
        task_score_span.append(
            $("<img class=\"details\" src=\"{{ url("static", "loading.gif") }}\"/>"));
    }
    task_score_elem.removeClass("undefined");
    task_score_elem.removeClass("score_0");
    task_score_elem.removeClass("score_0_100");
    task_score_elem.removeClass("score_100");
    task_score_elem.addClass(get_score_class(task_score, max_score));
};

update_task_scores = function (submission_id, data) {
    var terminal_status = is_status_terminal(data["status"]);

    if (terminal_status) {
        update_task_score(
            $("#task_score_public"),
            data["task_public_score"], data["task_public_score_message"],
            data["task_score_is_partial"], data["max_public_score"]);
{% if can_use_tokens %}
        update_task_score(
            $("#task_score_tokened"),
            data["task_tokened_score"], data["task_tokened_score_message"],
            data["task_score_is_partial"], data["max_score"]);
{% endif %}
    } else {
        schedule_update_task_scores(submission_id);
    }
};

schedule_update_task_scores = function (submission_id) {
    if (typeof(schedule_update_task_scores.delays) === "undefined") {
        schedule_update_task_scores.delays = {};
    }
    if (!schedule_update_task_scores.delays[submission_id]) {
        schedule_update_task_scores.delays[submission_id] = 1000.0;
    } else {
        // We want exponential backoff, but slightly staggered across submissions to
        // avoid asking about all of them at the same time, so we use 1.4 plus a
        // value depending on the submission id.
        var hash = (37 * parseInt(submission_id)) % 100 / 100.0;
        schedule_update_task_scores.delays[submission_id] =
            schedule_update_task_scores.delays[submission_id]
                * (1.4 + hash * 0.2);
    }
    setTimeout(function () {
        $.get(utils.contest_url("tasks", "{{ task.name }}", "submissions", submission_id), function (data) {
            update_task_scores(submission_id, data);
        });
    }, schedule_update_task_scores.delays[submission_id]);
};

$(document).ready(function () {
    $('#task_score_public').each(
        function (idx, elem) {
            for (var i = 0; i< official_submission_ids.length; ++i) {
                var sid = official_submission_ids[i];
                if (typeof(sid) !== 'undefined') {
                    schedule_update_task_scores(sid);
                }
            }
        }
    );
});
