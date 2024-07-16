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
                'x': x,
                'y': y
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


    window.addEventListener('onmousedown', function () {

        let scr = (".scroll");
        scr.onmousedown(function (event) {

            let startX = this.scrollLeft + event.pageX;
            let startY = this.scrollTop + event.pageY;

            scr.onmousemove(function () {

                this.scrollLeft = startX - event.pageX;
                this.scrollTop = startY - event.pageY;
                return false;
            });
        });

        window.onmouseover(function () {
            scr.off("onmousemove");
        });

    })

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
        .attr('id', d => d.id)
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

    // svg.selectAll('text.iconname')
    //     .data(transport)
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'rect_transport')
    //     .attr('x', d => node_x(d.node) - 70)
    //     .attr('y', d => node_y(d.node) - 74);


    // let timedX, timedY;

    playBtn.addEventListener('click', () => {
        for (countTask = -1; countTask <= 120; countTask++) {
            (function loop(countTask) {
                window.setTimeout(function () {
                    let i = 0;
                    let allTime = actions.filter((index) => index.time == countTask);

                    while (i < allTime.length) {
                        keys_object(allTime[i])[1] == 'mining' ? 
                        mining_action(allTime[i]) :
                            (keys_object(allTime[i])[1] == 'loading' ?
                            loading_action(allTime[i]) :
                                (keys_object(allTime[i])[1] == 'travel' ?
                                travel_action(allTime[i]) :
                                    set_type_action(allTime[i])));

                        // if (document.querySelectorAll(`[x="${timedX}"][y="${timedY}"]`).length > 1) {
                        //     svg.select('.' + allTime[i].travel.move.replace('/', '\\/'))
                        //         .transition()
                        //         .duration(() => 300)
                        //         .attr('y', () => document.querySelector(`.${allTime[i].travel.move.replace('/', '\\/')}`).getAttribute('y') - (marginY * 2))


                        //     svg.select('#field' + allTime[i].travel.move.replace('/', '\\/'))
                        //         .transition()
                        //         .duration(() => 300)
                        //         .attr('y', () => document.querySelector(`.${allTime[i].travel.move.replace('/', '\\/')}`).getAttribute('y') - (marginY * 2))
                        // }

                        i++;
                    }
                    condition.value = countTask;
                }, countTask * speed);
            }(countTask));
        }
    })

    play_forward.addEventListener('click', () => {
        speed = 500;
    })

    play_backBtn.addEventListener('click', () => {
        clearTimeout(loop);
        speed = 0;
    })

    const mining_action = (allTime) => {
        svg.select('.' + allTime.mining.from.replace('/', '\\/'))
        .attr('raw_material', () => allTime.mining.raw_material)
        .attr('type', () => allTime.mining.type)
    }

    const loading_action = (allTime) => {
        svg.select('.' + allTime.loading.to.replace('/', '\\/'))
            .transition()
            .duration(() => allTime.loading.duration * speed)
            .attr('raw_material', () => allTime.loading.raw_material)
            .attr('type', () => allTime.loading.type);  

            const past_raw = svg.select('.' + allTime.loading.from.replace('/', '\\/')).attr('raw_material');
            
        svg.select('.' + allTime.loading.from.replace('/', '\\/'))
            .attr('raw_material', past_raw - allTime.loading.raw_material)

    }

    const travel_action = (allTime) => {

        svg.select('.' + allTime.travel.move.replace('/', '\\/'))
            .transition()
            .duration(() => allTime.travel.duration * speed)
            .attr('x', () => node_x(allTime.travel.to) - marginX)
            .attr('y', () => node_y(allTime.travel.to) - marginY);

        svg.select('#field' + allTime.travel.move.replace('/', '\\/'))
            .transition()
            .duration(() => allTime.travel.duration * speed)
            .attr('x', () => node_x(allTime.travel.to) - marginX)
            .attr('y', () => node_y(allTime.travel.to) - marginY);



    }
    const set_type_action = (allTime) => {
        svg.select('.' + allTime.set_new_type.to.replace('/', '\\/'))
            .transition()
            .duration(() => allTime.set_new_type.duration * speed)
            .attr('raw_material', () => allTime.set_new_type.raw_material)
            .attr('type', () => allTime.set_new_type.type);
    }

    // svg.selectAll('line').raise();
    svg.selectAll('text').raise();
    // svg.selectAll('circle').raise();
    const allSectors = document.querySelectorAll('svg circle');
    const allTransportImage = document.querySelectorAll('g image')
})