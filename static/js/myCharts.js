let data = [
    {"xp": 45, "language": "Python", "date": "2019-12-02"},
    {"xp": 3280, "language": "Python", "date": "2019-12-03"},
    {"xp": 60, "language": "JavaScript", "date": "2019-12-04"},
    {"xp": 5, "language": "Plain text", "date": "2019-12-04"},
    {"xp": 2727, "language": "Python", "date": "2019-12-04"},
    {"xp": 230, "language": "Markdown", "date": "2019-12-04"},
    {"xp": 1500, "language": "Python", "date": "2019-12-05"},
    {"xp": 67, "language": "Python", "date": "2019-12-06"},
    {"xp": 199, "language": "C/C++", "date": "2019-12-06"},
    {"xp": 891, "language": "Python", "date": "2019-12-07"},
    {"xp": 1073, "language": "Python", "date": "2019-12-08"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-12-02', '2019-12-03', '2019-12-04', '2019-12-05', '2019-12-06', '2019-12-07', '2019-12-08'];

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