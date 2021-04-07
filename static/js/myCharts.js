let xhr = new XMLHttpRequest();

xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
        let data = JSON.parse(xhr.responseText)['data']['profile']['day_language_xps'];
        let languages = Array.from(new Set(data.map(v => v.language)));
        let dates = Array.from(new Set(data.map(v => v.date)));

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
                data: dates
            },
            yAxis: {
                type: 'value'
            },
            series: languages.map(lang => ({
                name: lang,
                type: 'bar',
                stack: 'total',
                data: getValue(lang)
            })),
            color: ["#3e4053", "#F15854", "#5DA5DA", "#FAA43A",
                "#60BD68", "#F17CB0", "#B2912F", "#DECF3F",
                "#B276B2", "#4D4D4D"]
        };

        function getValue(lang) {
            let list = [];
            dates.forEach(date => {
                let index = data.findIndex(v => v.date === date && v.language === lang);
                list = index >= 0 ? list.concat(data[index].xp) : list.concat(0);
            });
            return list;
        }

        let myChart = echarts.init(document.querySelector('#code_stats'), 'macarons');
        myChart.setOption(options);
        window.addEventListener("resize", () => myChart.resize());
    }
};

function dateformat(date) {
    return [{ year: 'numeric' }, { month: '2-digit' }, { day: '2-digit' }]
        .map((m) => new Intl.DateTimeFormat('en', m).format(date))
        .join('-');
}

let date = new Date().getTime();
date -= date % 86400000 + 14*86400000;
const since = dateformat(new Date().setTime(date));

xhr.open('POST', 'https://www.hozijui.com/codestats');
xhr.send(`{profile(username: "zjui") {day_language_xps: dayLanguageXps(since: "${since}") {date language xp}}}`);
