// Medal Tally: Circular Packed Chart
function drawMedalTally() {
    d3.csv("data_paris_olympics/medals_total.csv").then(function (data) {
        const width = 800, height = 800;

        const hierarchyData = d3.hierarchy({
            name: "root",
            children: data.map(d => ({
                name: d.country_long,
                value: +d.Total
            }))
        }).sum(d => d.value);

        const pack = d3.pack().size([width, height]).padding(3);
        const root = pack(hierarchyData);

        const svg = d3.select("#medal-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const tooltip = d3.select("body").append("div").attr("class", "tooltip");

        svg.selectAll("circle")
            .data(root.descendants())
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r)
            .attr("fill", d => d.depth === 0 ? "#fdae61" : d.depth === 1 ? "#fee08b" : "#91bfdb")
            .on("mouseover", function (event, d) {
                if (d.depth > 0) {
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                    tooltip.style("opacity", 1)
                        .style("left", `${event.pageX + 5}px`)
                        .style("top", `${event.pageY + 5}px`)
                        .html(`<strong>${d.data.name}</strong>: ${d.value}`);
                }
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", "none");
                tooltip.style("opacity", 0);
            });
    });
}

// Participation by Sport and Gender: Sunburst Chart
function drawParticipationSunburst() {
    d3.csv("data_paris_olympics/athletes.csv").then(function (data) {
        const width = 800, radius = width / 2;

        const hierarchyData = d3.hierarchy({
            name: "root",
            children: Array.from(d3.group(data, d => d.disciplines, d => d.gender), ([discipline, genders]) => ({
                name: discipline,
                children: Array.from(genders, ([gender, athletes]) => ({
                    name: gender,
                    value: athletes.length
                }))
            }))
        }).sum(d => d.value);

        const partition = d3.partition().size([2 * Math.PI, radius]);
        const root = partition(hierarchyData);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        const svg = d3.select("#sunburst-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", width)
            .append("g")
            .attr("transform", `translate(${radius},${radius})`);

        const tooltip = d3.select("body").append("div").attr("class", "tooltip");

        svg.selectAll("path")
            .data(root.descendants())
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => d.depth === 1 ? "#d7191c" : d.depth === 2 ? "#fdae61" : "#abdda4")
            .on("mouseover", function (event, d) {
                if (d.depth > 0) {
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                    tooltip.style("opacity", 1)
                        .style("left", `${event.pageX + 5}px`)
                        .style("top", `${event.pageY + 5}px`)
                        .html(`<strong>${d.data.name}</strong>: ${d.value}`);
                }
            });
    });
}

// Event Schedule with Dropdown: Dynamic Visualization
function drawEventScheduleWithDropdown() {
    d3.csv("data_paris_olympics/schedules.csv").then(function (data) {
        const sports = [...new Set(data.map(d => d.discipline))];

        const dropdown = d3.select("#event-schedule")
            .append("select")
            .on("change", function () {
                const selectedSport = this.value;
                updateVisualization(selectedSport);
            });

        dropdown.selectAll("option")
            .data(sports)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        function updateVisualization(sport) {
            const filteredData = data.filter(d => d.discipline === sport);
            const svg = d3.select("#schedule-visualization");
            svg.selectAll("*").remove();

            svg.selectAll("circle")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => i * 50 + 20)
                .attr("cy", 50)
                .attr("r", 10)
                .attr("fill", "blue")
                .append("title")
                .text(d => `${d.start_date}: ${d.venue}`);
        }

        // Initialize with the first sport
        updateVisualization(sports[0]);
    });
}

// Call all visualizations
drawMedalTally();
drawParticipationSunburst();
drawEventScheduleWithDropdown();
