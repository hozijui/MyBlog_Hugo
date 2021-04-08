function dateformat(date) {
    return [{ year: 'numeric' }, { month: '2-digit' }, { day: '2-digit' }]
        .map((m) => new Intl.DateTimeFormat('en', m).format(date))
        .join('-');
}

function getDates(startDate, days) {
    let dateArray = [];
    while (days >= 0) {
        let tmp = new Date(startDate);
        tmp.setDate(tmp.getDate() - days);
        dateArray.push(dateformat(tmp))
        days--;
    }
    return dateArray;
}

function getValue(data, lang, dates) {
    let list = [];
    dates.forEach(date => {
        let index = data.findIndex(v => v.date === date && v.language === lang);
        list = index >= 0 ? list.concat(data[index].xp) : list.concat(0);
    });
    return list;
}

const dates = getDates(new Date(), 6);
const since = dates[0];

let xhr = new XMLHttpRequest();

xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
        let data = JSON.parse(xhr.responseText)['data']['profile']['day_language_xps'];
        let languages = Array.from(new Set(data.map(v => v.language)));

        let options = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {type: 'shadow'},
                formatter: (params) => {
                    let show_str = `${params[0].axisValue}<br/>`;
                    for (let param of params) {
                        if (param.data !== 0) {
                            show_str += `${param.marker}${param.seriesName}: ${param.data}<br/>`;
                        }
                    }
                    return show_str;
                }
            },
            legend: {
                left: '2%',
                right: '3%',
                type: 'scroll',
                align: 'left',
                data: languages
            },
            grid: {
                top: '12%',
                left: '3%',
                right: '4%',
                bottom: 0,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                axisLabel: {
                    margin: 15
                },
                data: dates.map(v => v.slice(5))
            },
            yAxis: {
                type: 'value'
            },
            series: languages.map(lang => ({
                name: lang,
                type: 'bar',
                stack: 'total',
                data: getValue(data, lang, dates)
            }))
        };

        const currentTheme = window.localStorage && window.localStorage.getItem('theme');
        let myChart = echarts.init(document.querySelector('#code_stats'), currentTheme || 'light');
        myChart.setOption(options);
        window.addEventListener("resize", () => myChart.resize());
        window.addEventListener("setItemEvent", function (e) {
            myChart.dispose();
            myChart = echarts.init(document.querySelector('#code_stats'), e.newValue);
            myChart.setOption(options);
        });
    }
};

xhr.open('POST', 'https://www.hozijui.com/codestats');
xhr.send(`{profile(username: "zjui") {day_language_xps: dayLanguageXps(since: "${since}") {date language xp}}}`);
