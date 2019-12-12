function getNext(ele) {
    let arr = [];
    let parent = ele.parentElement;
    let brothers = parent.children;

    for (let i=brothers.length-1;i>=0;i--) {
        arr.unshift(brothers[i]);
        if (brothers[i] === ele) break;
    }

    return arr;
}

function collapsible_init() {
    let reports = document.querySelectorAll('h2');
    if (reports.length > 7) {
        let collapse_div = document.createElement('div');
        collapse_div.className = 'collapsible hidden';

        let collapse_reports = getNext(reports[7]);
        collapse_reports.forEach(ele => {
            ele.parentNode.replaceChild(collapse_div, ele);
            collapse_div.appendChild(ele);
        });

        let collapse_btn = `
            <h2 class="collapse_btn" onclick="display_toggle(this)">
                Earlier Report
                <i></i>
            </h2>
        `;
        collapse_div.insertAdjacentHTML('beforebegin', collapse_btn);
    }
}

function display_toggle(btn) {
    let collapse_div = document.querySelector('.collapsible');
    if (collapse_div.classList.contains('hidden')) {
        collapse_div.className = 'collapsible';
        btn.style.backgroundColor = "#eee";
    } else {
        collapse_div.className = 'collapsible hidden';
        btn.style.backgroundColor = "";
    }
}

window.onload=() => collapsible_init();