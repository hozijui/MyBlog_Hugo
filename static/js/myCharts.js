let data = [
    {xp: 15, language: "Plain text", date: "2019-11-11"},
    {xp: 68, language: "Markdown", date: "2019-11-11"},
    {xp: 635, language: "HTML", date: "2019-11-11"},
    {xp: 96, language: "Java", date: "2019-11-11"},
    {xp: 9, language: "Java", date: "2019-11-12"},
    {xp: 2226, language: "Python", date: "2019-11-14"},
    {xp: 9, language: "JavaScript", date: "2019-11-15"},
    {xp: 7, language: "Plain text", date: "2019-11-15"},
    {xp: 280, language: "XML", date: "2019-11-15"},
    {xp: 2963, language: "Java", date: "2019-11-15"},
    {xp: 228, language: "Properties", date: "2019-11-15"},
    {xp: 22, language: "Vue", date: "2019-11-15"},
    {xp: 87, language: "SQL (MySQL)", date: "2019-11-15"},
    {xp: 8, language: "Java", date: "2019-11-16"},
    {xp: 55, language: "XML", date: "2019-11-17"},
    {xp: 1027, language: "Java", date: "2019-11-17"},
    {xp: 72, language: "Properties", date: "2019-11-17"},
];
let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-11-11', '2019-11-12', '2019-11-13', '2019-11-14', '2019-11-15', '2019-11-16', '2019-11-17'];

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
        list = index > 0 ? list.concat(data[index].xp) : list.concat(0);
    });
    return list;
}

let myChart = echarts.init(document.querySelector('#code_stats'), 'macarons');
myChart.setOption(options);
window.addEventListener("resize", () => myChart.resize());