let data = [
    {"xp": 29, "language": "Python", "date": "2019-11-25"},
    {"xp": 1377, "language": "Python", "date": "2019-11-26"},
    {"xp": 40, "language": "JavaScript", "date": "2019-11-28"},
    {"xp": 3, "language": "Plain text", "date": "2019-11-28"},
    {"xp": 229, "language": "Python", "date": "2019-11-28"},
    {"xp": 103, "language": "Markdown", "date": "2019-11-28"},
    {"xp": 28, "language": ".gitignore (GitIgnore)", "date": "2019-11-28"},
    {"xp": 62, "language": "Plain text", "date": "2019-11-29"},
    {"xp": 3815, "language": "Python", "date": "2019-11-29"},
    {"xp": 2746, "language": "Python", "date": "2019-11-30"},
    {"xp": 19, "language": "JavaScript", "date": "2019-12-01"},
    {"xp": 56, "language": "Plain text", "date": "2019-12-01"},
    {"xp": 1712, "language": "Python", "date": "2019-12-01"},
    {"xp": 107, "language": "Markdown", "date": "2019-12-01"},
    {"xp": 6, "language": ".gitignore (GitIgnore)", "date": "2019-12-01"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-11-25', '2019-11-26', '2019-11-27', '2019-11-28', '2019-11-29', '2019-11-30', '2019-12-01'];

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