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

    const marginX = 50;
    const marginY = 55;




    downloadButton.addEventListener('click', () => {
        const allSectors = document.querySelectorAll('svg[id="d3_line"] circle');
        const allTransportImage = document.querySelectorAll('g image')
        const allLines = document.querySelectorAll('svg[id="d3_line"] line');

        let JsonCurrentData = {
            time: condition.value,
            nodes: [],
            edges: {}
        }

        allSectors.forEach(circle => {
            const name = circle.getAttribute('class');
            const raw_material = circle.getAttribute('raw_material');
            const type = circle.getAttribute('type');
            const x = circle.getAttribute('cx');
            const y = circle.getAttribute('cy');

            JsonCurrentData.nodes.push({
                "id": name,
                "raw_material": raw_material,
                "type": type,
                "x" : x,
                "y" : y
            })
        })

        allTransportImage.forEach(image => {
            const name = image.getAttribute('class');
            const x = +image.getAttribute('x');
            const y = +image.getAttribute('y');
            const sector = document.querySelector(`svg circle[cx="${x + +marginX}"][cy="${y + +marginY}"]`);
            const sector_class = sector.getAttribute('class');
            const raw_material = image.getAttribute('raw_material');
            const type = image.getAttribute('type');
            const icon = image.getAttribute('href');

            JsonCurrentData.nodes.push({
                "id": name,
                "node" : sector_class,
                "raw_material": raw_material,
                "type": type,
                "icon": icon
            })
        })

        allLines.forEach(line => {
            const id = line.getAttribute('id');
            const x1 = line.getAttribute('x1');
            const y1 = line.getAttribute('y1');
            const node1_circle = document.querySelector(`svg circle[cx="${x1}"][cy="${y1}"]`);
            const node1 = node1_circle.getAttribute('class');
            const x2 = line.getAttribute('x2');
            const y2 = line.getAttribute('y2');
            const node2_circle = document.querySelector(`svg circle[cx="${x2}"][cy="${y2}"]`);
            const node2 = node2_circle.getAttribute('class');
            const styles = window.getComputedStyle(line);
            const stroke = styles.stroke;

            const edge_object = {
                "id" : id,
                "node1" : node1,
                "node2" : node2,
                "color" : stroke
            }
            JsonCurrentData.edges[`${node1}${node2}`] = edge_object;
                
            
        })

        let blob = new Blob([JSON.stringify(JsonCurrentData)], { type: 'application/json' })
        let link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', 'data_settings');
        link.click();
    })

    console.log(res[1]);

    document.querySelector('.upload').addEventListener('change', function() {
        let GetFile = new FileReader();

        GetFile.onload =  function(){
            const info = GetFile.result;
            const parsed = JSON.parse(info);
            const parsed_nodes = parsed.nodes;
            // if()
            createNode(parsed_nodes);

            const edges = parsed.edges;
            const parsed_edges = Object.values(edges);

            createLine(parsed_edges);
            createText(parsed_nodes);

            transport.forEach(index => {
                // const leftTable = document.querySelector(".lists");
        
                const transport = document.querySelector('.transport');
                const car = document.createElement('p');
                car.setAttribute('id', "car_" + index.id);
                car.textContent = index.id;
                transport.appendChild(car);
        
                const action = document.querySelector('.action');
                const pAction = document.createElement('p');
                pAction.setAttribute('id', "action_" + index.id);
                pAction.textContent = "Ожидание";
                action.appendChild(pAction);
        
                const timeStart = document.querySelector('.timeStart');
                const pTimeStart = document.createElement('p');
                pTimeStart.setAttribute('id', "timeStart_" + index.id)
                pTimeStart.textContent = "Бездействует";
                timeStart.appendChild(pTimeStart);
        
                const timeEnd = document.querySelector('.timeEnd');
                const pTimeEnd = document.createElement('p');
                pTimeEnd.setAttribute('id', "timeEnd_" + index.id)
                pTimeEnd.textContent = "Бездействует";
                timeEnd.appendChild(pTimeEnd);
        
                const locationFrom = document.querySelector('.locationFrom');
                const pLocationFrom = document.createElement('p');
                pLocationFrom.setAttribute('id', "locaitonFrom_" + index.id)
                pLocationFrom.textContent = "Простой";
                locationFrom.appendChild(pLocationFrom);
        
                const locationTo = document.querySelector('.locationTo');
                const pLocationTo = document.createElement('p');
                pLocationTo.setAttribute('id', "locaitonTo_" + index.id)
                pLocationTo.textContent = "Простой";
                locationTo.appendChild(pLocationTo);
        
                const count = document.querySelector('.count');
                const pCount = document.createElement('p');
                pCount.setAttribute('id', "count_" + index.id)
                pCount.textContent = 0;
                count.appendChild(pCount);
        
                const type = document.querySelector('.type');
                const pType = document.createElement('p');
                pType.setAttribute('id', "type_" + index.id)
                pType.textContent = "0.0%";
                type.appendChild(pType);
        
                // tableElem.setAttribute('class', 'list-table' + index.id);
                // tableElem.setAttribute('id', 'list');
                // i++
                openModal();
            })

            // parsed.forEach(index => {
            //     const classTo = index.name.replace('/', '\\/');
            //     const count = index.raw_material;
            //     const type = index.type;
            //     const x = index.x;
            //     const y = index.y;
                
            //     svg.select('.' + classTo)
            //     .attr('raw_material', () => count)
            //     .attr('type', () => type)
            //     .attr('x', () => x)
            //     .attr('y', () => y)

            //     svg.select('#field' + classTo)
            //     .attr('x', () => x - marginX)
            //     .attr('y', () => y)
            // })
        }
          GetFile.readAsText(this.files[0]);
      })

    const createNode = (e) => {
        svg.selectAll('circle')
            .data(e)
            .enter()
            .append('circle')
            .attr('class', d => d.id)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('r', 5);

        svg.selectAll("image#icon")
            .data(graph_node)
            .enter()
            .append("svg:image")
            .attr('class', d =>d.id)
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .data(capacity_value)
            .attr('xlink:href', d => d.image)
            .style('color', d => d.color);
    }

    const createLine = (e) => {
        svg.selectAll('line')
            .data(e)
            .enter()
            .append('line')
            .attr('id', d => d.id)
            .attr('x1', d => node_x(d.node1))
            .attr('y1', d => node_y(d.node1))
            .attr('x2', d => node_x(d.node2))
            .attr('y2', d => node_y(d.node2))
            .style('stroke', d => d.color)
            .style('stroke-width', 5);            
    
        svg.append('g').classed('imagets', true).selectAll("image.transport")
            .data(transport)
            .enter()
            .append("svg:image")
            .attr('class', d => d.id)
            .attr('x', d => node_x(d.node) - marginX)
            .attr('y', d => node_y(d.node) - marginY)
            .attr('xlink:href', d => d.image)
            .style('color', d => d.color);
    }

    function createText(e){
        svg.selectAll('text')
            .data(e)
            .enter()
            .append('text')
            .attr('id', d => d.id)
            .attr('x', d => d.x - 20)
            .attr('y', d => d.y - 5)
            .text(d => d.id)
            .style('font-size', '16px')

        let sektor_capacity = [];
        for (let i of raw_concentrate) {
            i.name.slice(0, 6) == "Сектор" ? sektor_capacity.push({
                name: i.name,
                capacity: i.input_capacity,
                raw_cap: i.raw_concentration
            }) : '';
        }

        // svg.selectAll('text#_value')
        //     .data(sektor_capacity)
        //     .enter()
        //     .append('text')
        //     .attr('id', d => d.name + "_value")
        //     .attr('x', d => node_x(d.name))
        //     .attr('y', d => node_y(d.name) + 60)
        //     .text(d => d.capacity + '.00');

        // svg.selectAll('text#_raw_conc')
        //     .data(sektor_capacity)
        //     .enter()
        //     .append('text')
        //     .attr('id', d => d.name + "_raw_conc")
        //     .attr('x', d => node_x(d.name))
        //     .attr('y', d => node_y(d.name) + 80)
        //     .text(d => d.raw_cap + ".0%");

        svg.selectAll('text#field')
            .data(transport)
            .enter()
            .append('text')
            .attr('id', d => "field_" + d.id)
            .attr('x', d => node_x(d.node) - 70)
            .attr('y', d => node_y(d.node) - marginY)
            .text(d => d.id);
    }

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

    // play_backBtn.addEventListener('click', () => {
    //     clearTimeout(loop);
    //     speed = 0;
    // })

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

        // const actionChange = document.querySelector(`#action_${classTo}`);
        // actionChange.textContent = "";

        svg.select('.imagets_' + classTo)
            .transition()
            .duration(() => durationSec * speed)
            .attr('raw_material', () => count)
            .attr('type', () => type);  
            
        svg.select('.imagets_' + classFrom)
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

        svg.select('#field_' + move)
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

        svg.select('.imagets_' + classTo)
            .transition()
            .duration(() => duration * speed)
            .attr('raw_material', () => count)
            .attr('type', () => type);
    }

    const openModal = () => { 
    const modal_objects = svg.selectAll('image');
    modal_objects.on('click', (e) => {

        console.log('click');
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
        modal_info.style.listStyle = "none";
        modal_info.style.marginTop = "20px";
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
    })}

    const header = document.querySelector('.header');
    const table = document.querySelector('.table');
    const lists = document.querySelector('.lists');

    header.addEventListener('mousedown', getHeaderY);

    function getHeaderY() {
        let flag = true;
        if (flag) {
            header.removeEventListener('mousedown', getHeaderY);
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', mouseMove)
                header.addEventListener('mousedown', getHeaderY);
            }, { once: true })
        }

    }

    function mouseMove(ev) {
        let height = window.innerHeight - ev.clientY;
        table.style.height = height + 'px';
        lists.style.height = height - 40 + 'px';
        console.log(height);
    }


    // svg.selectAll('line').raise();
    svg.selectAll('text').raise();
    // svg.selectAll('circle').raise();

})