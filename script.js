// let pointer = 0;
// let sectionPointer = 0;
const svg = d3.select('#d3_line')

const fetchReq1 = fetch(
    "./ui shicht/blending_capacity.json"
).then((res) => res.json());

const fetchReq2 = fetch(
    "./ui shicht/blending_graph.json"
).then((res) => res.json());

const fetchReq3 = fetch(
    "./ui shicht/blending_transport.json"
).then((res) => res.json());

const fetchReq4 = fetch(
    "./ui shicht/kachkanar_nodes.json"
).then((res) => res.json());

const fetchReq5 = fetch(
    "./ui shicht/kachkanar_transport_full.json"
).then((res) => res.json());

const fetchReq6 = fetch(
    "./ui shicht/transport_settings.json"
).then((res) => res.json());

const fetchReq7 = fetch(
    "./ui shicht/blending_actions.json"
).then((res) => res.json());

const allData = Promise.all([fetchReq1, fetchReq2, fetchReq3, fetchReq4, fetchReq5, fetchReq6, fetchReq7]);

allData.then((res) => {

    const graph_node = res[1].nodes;
    const graph_edge = res[1].edges;
    const transport = res[2];
    const capacity_blend = res[0];
    const raw_concentrate = res[3];
    const actions = res[6];

    const edges_value = Object.values(graph_edge);
    const capacity_value = Object.values(capacity_blend);

    const node_x = (node) => {
        return +document.querySelector(`.${node}`.replace('/', '\\/')).getAttribute('cx');
    }
    const node_y = (node) => {
        return +document.querySelector(`.${node}`.replace('/', '\\/')).getAttribute('cy');
    }

    const condition = document.querySelector('#condition');
    let speed = 1000;
    const downloadButton = document.querySelector('.btnDownload');

    const playBtn = document.querySelector(".play-pause");
    const play_backBtn = document.querySelector(".play-pause-back");
    const play_forward = document.querySelector(".play-forward");

    const keys_object = (array) => {
        return Object.keys(array);
    }

    const marginX = 40;
    const marginY = 40;


    downloadButton.addEventListener('click', () => {
        let JsonCurrentData = [];

        let newObject = {
            time: condition.value,
            data: []
        }

        allSectors.forEach(circle => {
            const name = circle.getAttribute('class');
            const raw_material = circle.getAttribute('raw_material');
            const type = circle.getAttribute('type');
            const x = circle.getAttribute('cx');
            const y = circle.getAttribute('cy');

            newObject.data.push({
                "name": name,
                "raw_material": raw_material,
                "type": type,
            })
        })

        allTransportImage.forEach(image => {
            const name = image.getAttribute('class');
            const x = image.getAttribute('x');
            const y = image.getAttribute('y');
            const raw_material = image.getAttribute('raw_material');
            const type = image.getAttribute('type');
            const icon = image.getAttribute('href');

            newObject.data.push({
                "name": name,
                "raw_material": raw_material,
                "type": type,
                'x': x,
                'y': y,
                "icon": icon
            })
        })
        JsonCurrentData.push(newObject);
        let norm = { ...JsonCurrentData };

        let blob = new Blob([JSON.stringify(norm)], { type: 'application/json' })
        let link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', 'data_settings');
        link.click();

        console.log(link);

    })

    document.querySelector('.upload').addEventListener('change', function() {
        var GetFile = new FileReader();

        GetFile .onload=function(){
            const info = GetFile.result;
            const norm = JSON.parse(info);
            const dataArray = norm[0].data;
            console.log(dataArray);
            dataArray.forEach(index => {
                const classTo = index.name.replace('/', '\\/');
                const count = index.raw_material;
                const type = index.type;
                const x = index.x;
                const y = index.y;
                
                svg.select('.' + classTo)
                .attr('raw_material', () => count)
                .attr('type', () => type)
                .attr('x', () => x)
                .attr('y', () => y)

                svg.select('#field' + classTo)
                .attr('x', () => x - marginX)
                .attr('y', () => y)
            })


        }
          GetFile.readAsText(this.files[0]);
      })
    // window.addEventListener('onmousedown', function () {

    //     let scr = (".scroll");
    //     scr.onmousedown(function (event) {

    //         let startX = this.scrollLeft + event.pageX;
    //         let startY = this.scrollTop + event.pageY;

    //         scr.onmousemove(function () {

    //             this.scrollLeft = startX - event.pageX;
    //             this.scrollTop = startY - event.pageY;
    //             return false;
    //         });
    //     });

    //     window.onmouseover(function () {
    //         scr.off("onmousemove");
    //     });

    // })

    svg.selectAll('circle')
        .data(graph_node)
        .enter()
        .append('circle')
        .attr('class', d => d.id)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', 5);

    svg.selectAll('line')
        .data(edges_value)
        .enter()
        .append('line')
        .attr('id', d => d.id)
        .attr('x1', d => node_x(d.node1))
        .attr('y1', d => node_y(d.node1))
        .attr('x2', d => node_x(d.node2))
        .attr('y2', d => node_y(d.node2))
        .style('stroke', d => d.color)
        .style('stroke-width', 5);

    svg.selectAll("image#icon")
        .data(graph_node)
        .enter()
        .append("svg:image")
        .attr('class', d => d.id)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .data(capacity_value)
        .attr('xlink:href', d => d.image)
        .style('color', d => d.color);

    svg.append('g').classed('imagets', true).selectAll("image.transport")
        .data(transport)
        .enter()
        .append("svg:image")
        .attr('class', d => d.id)
        .attr('x', d => node_x(d.node) - marginX)
        .attr('y', d => node_y(d.node) - marginY)
        .attr('xlink:href', d => d.image)
        .style('color', d => d.color);

    svg.selectAll('text')
        .data(graph_node)
        .enter()
        .append('text')
        .attr('id', d => d.id)
        .attr('x', d => d.x - 20)
        .attr('y', d => d.y - 5)
        .text(d => d.id)
        .style('font-size', '24px')

    let sektor_capacity = [];
    for (let i of raw_concentrate) {
        i.name.slice(0, 6) == "Сектор" ? sektor_capacity.push({
            name: i.name,
            capacity: i.input_capacity,
            raw_cap: i.raw_concentration
        }) : '';
    }

    svg.selectAll('text#_value')
        .data(sektor_capacity)
        .enter()
        .append('text')
        .attr('id', d => d.name + "_value")
        .attr('x', d => node_x(d.name))
        .attr('y', d => node_y(d.name) + 60)
        .text(d => d.capacity + '.00');


    svg.selectAll('text#_raw_conc')
        .data(sektor_capacity)
        .enter()
        .append('text')
        .attr('id', d => d.name + "_raw_conc")
        .attr('x', d => node_x(d.name))
        .attr('y', d => node_y(d.name) + 80)
        .text(d => d.raw_cap + ".0%");

    svg.selectAll('text#field')
        .data(transport)
        .enter()
        .append('text')
        .attr('id', d => "field" + d.id)
        .attr('x', d => node_x(d.node) - 70)
        .attr('y', d => node_y(d.node) - marginY)
        .text(d => d.id);

    let leftTable = document.querySelector(".lists");

    
let i = 0;
    transport.forEach(index => {
        const tableElem = document.createElement('div');
        const car = document.createElement('p');
        const action = document.createElement('p');
        const timeStart = document.createElement('p');
        const timeEnd = document.createElement('p');
        const locationFrom = document.createElement('p');
        const locationTo = document.createElement('p');
        const count = document.createElement('p');
        const type = document.createElement('p');

        car.setAttribute('class', 'tableCar');
        action.setAttribute('class', 'tableActiom')
        timeStart.setAttribute('class', 'tableStart')
        timeEnd.setAttribute('class', 'tableEnd')
        locationFrom.setAttribute('class', 'tableLocationFrom')
        locationTo.setAttribute('class', 'tableLocationTo')    
        count.setAttribute('class', 'tableCount')
        type.setAttribute('class', 'tableType')
        leftTable.append(tableElem);
        tableElem.setAttribute('class', 'list-table' + index.id);
        tableElem.setAttribute('id', 'list');

        console.log(index, i);
        tableElem.appendChild(car);
        tableElem.appendChild(action);
        tableElem.appendChild(timeStart);
        tableElem.appendChild(timeEnd);
        tableElem.appendChild(locationFrom);
        tableElem.appendChild(locationTo);
        tableElem.appendChild(count);
        tableElem.appendChild(type);
        car.textContent = index.id;
        action.textContent = "Ожидание";
        timeStart.textContent = 1;
        timeEnd.textContent = 2;
        locationFrom.textContent = index.node;
        locationTo.textContent = "Не движется"
        count.textContent = 1000
        type.textContent = 1
        console.log(i);
        i++
    })

   

    // svg.selectAll('text.iconname')
    //     .data(transport)
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'rect_transport')
    //     .attr('x', d => node_x(d.node) - 70)
    //     .attr('y', d => node_y(d.node) - 74);


    // let timedX, timedY;
    const taskLength = actions.length;
    const maximumCountTask = (taskLength) => {
        let maximize = 0;
        for(i = 0; i < taskLength - 1; i++){
            if(Object.values(actions)[i].time < Object.values(actions)[i+1].time){
                maximize = Object.values(actions)[i+1].time;
            };
        }
        console.log(maximize, taskLength);
        return maximize;
    }

    function loop(countTask) {
        window.setTimeout(function () {
            let i = 0;
            let allTime = actions.filter((index) => index.time == countTask);
            console.log(allTime);
            while (i < allTime.length) {
                if(keys_object(allTime[i])[1] == 'mining'){
                    mining_action(allTime[i])
                }
                else if(keys_object(allTime[i])[1] == 'loading'){
                    loading_action(allTime[i])
                }
                else if(keys_object(allTime[i])[1] == 'travel'){
                    travel_action(allTime[i])
                }
                else{
                    set_type_action(allTime[i])
                }

                i++;

            }
            condition.value = countTask;
        }, countTask * speed);
    };

    playBtn.addEventListener('click', () => {
        let count = maximumCountTask(taskLength) 
        for (countTask = -1; countTask <= count; countTask++) {
           loop(countTask);
        }
    })

    play_forward.addEventListener('click', () => {
        speed = 500;
    })

    play_backBtn.addEventListener('click', () => {
        clearTimeout(loop);
        speed = 0;
    })

    const mining_action = (e) => {
        const count = e.mining.raw_material;
        const type = e.mining.type;
        const classFrom = e.mining.from.replace('/', '\\/');

        svg.select('.' + classFrom)
        .attr('raw_material', () => count)
        .attr('type', () => type)
    }

    const loading_action = (e) => {
        const classTo = e.loading.to.replace('/', '\\/');
        const classFrom = e.loading.from.replace('/', '\\/');
        const durationSec = e.loading.duration;
        const count = e.loading.raw_material;
        const type = e.loading.type;
        const past_raw = svg.select('.' + e.loading.from.replace('/', '\\/')).attr('raw_material');

        const lil = document.querySelector("li[class="+`${classTo}`+"]")
        console.log(lil);

        svg.select('.' + classTo)
            .transition()
            .duration(() => durationSec * speed)
            .attr('raw_material', () => count)
            .attr('type', () => type);  
            
        svg.select('.' + classFrom)
            .attr('raw_material', past_raw - count)

    }

    const travel_action = (e) => {
        const to = e.travel.to;
        const durationSec = e.travel.duration;
        const move = e.travel.move.replace('/', '\\/')

        svg.select('.' + move)
            .transition()
            .duration(() => durationSec * speed)
            .attr('x', () => node_x(to) - marginX)
            .attr('y', () => node_y(to) - marginY);

        svg.select('#field' + move)
            .transition()
            .duration(() => durationSec * speed)
            .attr('x', () => node_x(to) - marginX)
            .attr('y', () => node_y(to) - marginY);



    }
    const set_type_action = (e) => {
        const classTo = e.set_new_type.to.replace('/', '\\/');
        const duration = e.set_new_type.duration;
        const count = e.set_new_type.raw_material;
        const type = e.set_new_type.type;

        svg.select('.' + classTo)
            .transition()
            .duration(() => duration * speed)
            .attr('raw_material', () => count)
            .attr('type', () => type);
    }

    const modal_objects = svg.selectAll('image');
    modal_objects.on('click', (e) => {

        const modal_window = document.createElement('div');
        modal_window.setAttribute('class','modal-view');
        
        const modalX = e.pageX;
        const modalY = e.pageY;

        const imgText = document.createElement('p');
        imgText.textContent = e.target.getAttribute('class');

        const closeButton = document.createElement('button');
        closeButton.setAttribute('class','xBtn');
        closeButton.innerHTML = 'X';

        const modal_info = document.createElement('ul');
        const raw_count = document.createElement('li');
        const raw_type = document.createElement('li');
        raw_count.textContent = "Количество руды: " + e.target.getAttribute('raw_material')
        raw_type.textContent = "Концентрация: " + e.target.getAttribute('type')



        document.body.appendChild(modal_window);
        modal_window.style.display = 'flex';
        modal_window.style.position = 'absolute';
        modal_window.style.left = modalX - 200 + 'px';
        modal_window.style.top = modalY - 100 + 'px';

        modal_window.appendChild(imgText);
        modal_window.appendChild(modal_info);
        modal_info.append(raw_count, raw_type)
        modal_window.appendChild(closeButton);

        let buttonX = document.querySelectorAll('.xBtn');
        buttonX.forEach(index => {
            index.addEventListener('click', (e) => { 
                document.body.removeChild(e.target.parentNode);
            });
        })
    })

    const header = document.querySelector('.header');
    const table = document.querySelector('.table');
    const headerNavItems = document.querySelectorAll('.column-p');
    const lists = document.querySelector('.lists');

    header.addEventListener('mousedown', getHeaderY);

    function getHeaderY(e) {
        let flag = true;
        for (i of headerNavItems) {
            if (e.target == i) {
                flag = false;
            }
        }
        if (flag) {
            header.removeEventListener('mousedown', getHeaderY);
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', e => {
                document.removeEventListener('mousemove', mouseMove)
                header.addEventListener('mousedown', getHeaderY);
            }, { once: true })
        }

    }

    function mouseMove(ev) {

        let heito = window.innerHeight - ev.clientY;
        table.style.height = heito + 'px';
        lists.style.height = heito - 80 + 'px';
        console.log( lists.style.height);
    }


    // svg.selectAll('line').raise();
    svg.selectAll('text').raise();
    // svg.selectAll('circle').raise();
    const allSectors = document.querySelectorAll('svg circle');
    const allTransportImage = document.querySelectorAll('g image')
})
