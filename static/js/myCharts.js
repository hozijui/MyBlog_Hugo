let data = [
    {xp: 255, language: "Go", date: "2019-11-18"},
    {xp: 245, language: "Markdown", date: "2019-11-20"},
    {xp: 9, language: "JSON", date: "2019-11-21"},
    {xp: 1201, language: "JavaScript", date: "2019-11-21"},
    {xp: 75, language: "Plain text", date: "2019-11-21"},
    {xp: 116, language: "Markdown", date: "2019-11-21"},
    {xp: 240, language: "HTML", date: "2019-11-21"},
    {xp: 15, language: "Plain text", date: "2019-11-23"},
    {xp: 2536, language: "Markdown", date: "2019-11-23"},
    {xp: 3, language: "Vue", date: "2019-11-23"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-11-18', '2019-11-19', '2019-11-20', '2019-11-21', '2019-11-22', '2019-11-23', '2019-11-24'];

let options = {
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
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
    }))
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