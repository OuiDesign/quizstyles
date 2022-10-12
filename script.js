const speed = 300;
const webhook = 'https://hook.eu1.make.com/e2uicenz5yi9vmudrp1fv8bhcax9xnih';
let answerCorrect = 0, pointsCorrect = 0, pointsTotal = 0;
let tTimeStart, tTimeFinish, tTimeDif, sec = 0, min = 0, hrs = 0, t;

function tick() {
    sec++;
    if (sec >= 60) {
        sec = 0;
        min++;
        if (min >= 60) {
            min = 0;
            hrs++;
        }
    }
}
function addSecond() {
    tick();
    document.querySelector('#timer').textContent = (min > 9 ? min : '0' + min) + ':' + (sec > 9 ? sec : '0' + sec);
    timerStart();
}
function timerStart() {
    t = setTimeout(addSecond, 1000);
}

function validateInput(name) {
    let regex = /^.*$/,
        result = false;
    if (name == 'full-name') {
        regex = /^[А-Яа-яЁёA-Za-z ,.'-]+$/i;
    } else if (name == 'email') {
        regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    } else if (name == 'phone') {
        regex = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    }
    result = regex.test($(`[name=${name}]`).val());
    return result
}

function inputReqComplete(div) {
    let check = [],
        inputs = div.find($('input,textarea,select').not($('[type="checkbox"]')));
    inputs.each(function() {
        if ($(this).filter('[required]:visible').val() != '') {
            inputName = $(this).attr('name');
            if (validateInput(inputName)) {
                $(this).removeClass('border-danger');
                $(this).next().slideUp(speed);
                check.push(true);
            } else {
                $(this).addClass('border-danger');
                $(this).next().text('Неправильный формат данных');
                $(this).next().slideDown(speed);
                check.push(false);
            }
        } else {
            $(this).addClass('border-danger');
            $(this).next().text('Поле обязательно для заполнения');
            $(this).next().slideDown(speed);
            check.push(false);
        }
    });
    let cb = div.find($('[type="checkbox"]'));
    cb.each(function() {
        if ($(this).filter('[required]:visible').length > 0 && $(this).prop('checked') == false) {
            $(this).parent().addClass('border-danger');
            $(this).parent().next().text('Поле обязательно для заполнения');
            $(this).parent().next().slideDown(speed);
            check.push(false);
        }
    })
    if (check.indexOf(false) == -1) {
        return true
    } else {
        setTimeout(() => {
            div.find('.next-step').attr({'data-disabled': false, 'disabled': false}).removeClass('disabled').tooltip('disable');
        }, 500);
        return false
    }
}

$.fn.randomize = function(childElem) {
    function shuffle(o) {
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };
    return this.each(function() {
        var $this = $(this);
        var elems = $this.children(childElem);

        shuffle(elems);

        $this.detach(childElem);

        for(var i=0; i < elems.length; i++) {
            $this.append(elems[i]);
        }
    });
}

$(document).on('keypress',function(e) {
    if(e.which == 13) {
        let nextStepBtn = $('.next-step').filter(':visible');
        nextStepBtn.data('disabled') != true && nextStepBtn.attr('disabled') != true && nextStepBtn.hasClass('disabled') != true ? nextStepBtn.click() : nextStepBtn.tooltip('show');
    }
});

let pic = [
    '#doc-and-docker',
    '#queen-prepare',
    '#queen-ready',
    '#queen-target, #portal',
    '#ruhnoprod',
    '#ruhnoprod-off, #portal',
    '#bagobotron',
    '#bagobotron-off',
    '#win'
]

function picture() {
    let picStep = parseInt($('.step').filter(':visible').data('picture')) - 1;
    for (let i in pic) {
        $(pic[i]).addClass('d-none');
    }
    $(pic[picStep]).removeClass('d-none');
}

$(function() {
    $('.answer-wrapper').randomize('.answer'); // рандомизация ответов

    let qWrapper = $('.question-wrapper');
    $('.question-number-max').text(qWrapper.length);
    qWrapper.each(function(i) {
        qNum = i + 1;
        $(this).attr('data-question', qNum);
    });

    // $('.answer-text').each(function() {
    //     answer = $(this).closest('.answer').data('title');
    //     $(this).text(answer)
    // });

    $('button.answer').on('click', function(e) {
        e.preventDefault();
        answer = $(this).find('span').text();
        qNum = $(this).closest('.step').data('question');
        $(`input[name=question-${qNum}]`).val(answer);
    });

    function answerVerification(response, el) {
        el.parent().find('button').removeClass('btn-success btn-danger').addClass('btn-secondary');
        if (response.correct) {
            answerCorrect++;
            pointsCorrect += response.points;
            el.removeClass('btn-secondary').addClass('btn-success')
        } else {
            el.removeClass('btn-secondary').addClass('btn-danger')
        }
        el.parent().find('button').off('click').removeClass('disabled').attr({'data-disabled': false, 'disabled': false});
        el.closest('.step').find('.next-step').attr({'data-disabled': false, 'disabled': false}).removeClass('disabled').tooltip('disable');
        pointsTotal += response.points;
    }

    $('[data-action="answer"]').click(function(e) {
        e.preventDefault();
        answerBtn = $(this);
        answerBtn.parent().find('button').off('click').addClass('disabled').attr({'data-disabled': true, 'disabled': true});
        data = new Object();
        data.question = parseInt($(this).closest('.step').data('question'));
        data.answer = answerBtn.text();
        $.ajax({
            url: webhook,
            data: data
        }).done(function(data) {
            response = JSON.parse(data);
            answerVerification(response, answerBtn);
        });
    });

    function currentQnum() {
        return parseInt($('.quiz-header .question-number').text())
    }

    function getResults() {
        $('.question-wrapper').addClass('d-none');
        $('.form-wrapper').css('min-height', '100px');
        tTimeFinish = new Date();
        tTimeDif = tTimeFinish - tTimeStart;
        clearTimeout(t);
        $('.next-step').addClass('d-none');
        $('#result').text(answerCorrect);
        $('#points').text(pointsCorrect);
        $('#points-max').text(pointsTotal);
        $('#leader-table').prepend($('<div>').attr('id', 'table-preloader'));
        $('#table-preloader').prepend(`<lottie-player src="https://lottie.host/50a41687-ad90-49ed-8d45-2bfda542e748/JeK2sMVr7E.json" background="transparent" speed="1" style="width: 100%; height: 100%;" loop autoplay></lottie-player>`);
        data = $('#quiz').serializeArray();
        data.push(
            {name: "result", value: answerCorrect},
            {name: "points", value: pointsCorrect},
            {name: "timer", value: tTimeDif}
        );
        $.ajax({
            url: webhook,
            data: data
        }).done(function(data) {
            picture();
            $(pic[pic.length-1]).removeClass('d-none');
            let response = JSON.parse(data);
            tableUpdate(response.leaders);
        });
        $('.quiz-header').addClass('d-none');
        $('.result').removeClass('d-none');
        $('.result-wrapper').filter(function() {
            return $(this).data('result-min') <= answerCorrect && $(this).data('result-max') >= answerCorrect
        }).removeClass('d-none');
        $('.result-wrapper').not($('.result-wrapper').filter(':visible')).remove();
        $('.leader-wrapper').removeClass('d-none');
        $('.next-step').tooltip('hide');
    }

    function nextStep(step) {
        div = $('.form-wrapper');
        height = step.height() + 48;
        div.css('min-height', height + 'px');
        step.addClass('d-none');
        let nextStep = step.next();
        nextStep.removeClass('d-none');
        height = nextStep.height() + 48;
        div.animate({'min-height': height + 'px'}, speed * 2);
        $('.quiz-header .question-number').text(nextStep.data('question'));
        if (currentQnum() == qWrapper.length) {
            $('#next.next-step').addClass('d-none');
            $('#stop.next-step').removeClass('d-none');
        }
        picture();
    }

    $('.next-step').click(function(e) {
        e.preventDefault();
        el = $(this);
        step = $('.step').filter(':visible');
        if (el.data('timer') == 'start' && inputReqComplete(step)) {
            tTimeStart = new Date();
            timerStart();
            $('.quiz-header').removeClass('d-none');
            $('.next-btn-wrapper #start').addClass('d-none');
            $('.next-btn-wrapper #next').removeClass('d-none');
        } else if (el.data('timer') == 'stop') {
            getResults();
        }
        if (el.data('action') == 'start' && inputReqComplete(step) || el.data('action') == 'next') {
            $('.info-wrapper').removeClass('d-none');
            nextStep(step);
        } else {
            if (step.hasClass('question-wrapper')) {
                step.find('[data-action="answer"]').addClass('pulse animated');
                setTimeout(() => { step.find('[data-action="answer"]').removeClass('pulse animated') }, speed * 3)
            }
        }
        el.attr({'data-disabled': true, 'disabled': true}).addClass('disabled').tooltip('enable');
    });

    function tableUpdate(data) {
        for (let i in data) {
            $('#leader-table table').find(`tbody tr:eq(${i})`).find('td:eq(0)').text(data[i].place);
            $('#leader-table table').find(`tbody tr:eq(${i})`).find('td:eq(1)').text(data[i].name);
            $('#leader-table table').find(`tbody tr:eq(${i})`).find('td:eq(2)').text(data[i].score);
            $('#leader-table table').find(`tbody tr:eq(${i})`).find('td:eq(3)').text(data[i].time);
            let timeTd = $('#leader-table table').find(`tbody tr:eq(${i})`).find('td:eq(3)');
            timeTd.text() != '' ? timeTd.text(new Date(parseFloat(timeTd.text()) * 1000).toISOString().substr(14, 9)) : false;
        }
        $('#table-preloader').remove();
    }
});
