let data = [
    {xp: 48, language: "Plain text", date: "2019-12-23"},
    {xp: 206, language: "Python", date: "2019-12-23"},
    {xp: 57, language: "Markdown", date: "2019-12-23"},
    {xp: 22, language: ".gitignore (GitIgnore)", date: "2019-12-23"},
    {xp: 20, language: "JSON", date: "2019-12-25"},
    {xp: 30, language: "JavaScript", date: "2019-12-25"},
    {xp: 4, language: "Plain text", date: "2019-12-25"},
    {xp: 453, language: "Python", date: "2019-12-25"},
    {xp: 331, language: "Markdown", date: "2019-12-25"},
    {xp: 29, language: "JSON", date: "2019-12-26"},
    {xp: 2129, language: "Python", date: "2019-12-26"},
    {xp: 43, language: "JSON", date: "2019-12-27"},
    {xp: 3646, language: "Python", date: "2019-12-27"},
    {xp: 245, language: "Vue", date: "2019-12-27"},
    {xp: 15, language: "JSON", date: "2019-12-28"},
    {xp: 21, language: "Plain text", date: "2019-12-28"},
    {xp: 2276, language: "Python", date: "2019-12-28"},
    {xp: 46, language: "Plain text", date: "2019-12-29"},
    {xp: 12, language: "HTML", date: "2019-12-29"},
    {xp: 24, language: "TOML", date: "2019-12-29"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-12-23', '2019-12-24', '2019-12-25', '2019-12-26', '2019-12-27', '2019-12-28', '2019-12-29'];

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