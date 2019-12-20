let data = [
    {"xp": 5, "language": "Plain text", "date": "2019-12-09"},
    {"xp": 133, "language": "Python", "date": "2019-12-09"},
    {"xp": 2621, "language": "Python", "date": "2019-12-10"},
    {"xp": 2363, "language": "Python", "date": "2019-12-11"},
    {"xp": 309, "language": "JavaScript", "date": "2019-12-12"},
    {"xp": 114, "language": "Plain text", "date": "2019-12-12"},
    {"xp": 466, "language": "Python", "date": "2019-12-12"},
    {"xp": 770, "language": "Markdown", "date": "2019-12-12"},
    {"xp": 1449, "language": "JavaScript", "date": "2019-12-13"},
    {"xp": 57, "language": "Plain text", "date": "2019-12-13"},
    {"xp": 3419, "language": "Python", "date": "2019-12-13"},
    {"xp": 48, "language": "Markdown", "date": "2019-12-13"},
    {"xp": 90, "language": "HTML", "date": "2019-12-13"},
    {"xp": 2, "language": "Ini", "date": "2019-12-13"},
    {"xp": 5, "language": "Plain text", "date": "2019-12-15"},
    {"xp": 2184, "language": "Python", "date": "2019-12-15"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-12-09', '2019-12-10', '2019-12-11', '2019-12-12', '2019-12-13', '2019-12-14', '2019-12-15'];

let options = {
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
            let show_str = `${params[0].axisValue}<br/>`;
            for (let param of params) {
                if (param.data !== 0){
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