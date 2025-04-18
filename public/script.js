const API_KEY = "u3Kk3TUsGANe6OMlaIMQNgjLWZlSMohrDK9DbXdO"; // Replace with your NASA API key
const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - 6); // fetch 7 days total

const start = startDate.toISOString().split("T")[0];
const end = today.toISOString().split("T")[0];

fetch(
  `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${API_KEY}`
)
  .then((response) => response.json())
  .then((data) => {
    const neos = Object.values(data.near_earth_objects).flat();

    const asteroidsWithDistance = neos.map((asteroid) => {
      const approachData = asteroid.close_approach_data[0];
      const distance = parseFloat(approachData.miss_distance.kilometers);
      // added size data - sam
      const diameterData = asteroid.estimated_diameter.kilometers;
      const averageDiameter =
        (diameterData.estimated_diameter_min +
          diameterData.estimated_diameter_max) /
        2;

      return {
        name: asteroid.name,
        distance,
        date: approachData.close_approach_date,
        speed: parseFloat(
          approachData.relative_velocity.kilometers_per_hour
        ).toFixed(2),
        averageDiameter, // added size data -sam
      };
    });

    // Normalize for animation
    const distances = asteroidsWithDistance.map((a) => a.distance);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    const normalize = (dist) => {
      const minGap = 15;
      const maxGap = 100;
      return (
        ((dist - minDistance) / (maxDistance - minDistance)) *
          (maxGap - minGap) +
        minGap
      );
    };

    // Sorting lists
    const sortedByDistance = [...asteroidsWithDistance].sort(
      (a, b) => a.distance - b.distance
    );
    const closest = sortedByDistance.slice(0, 4);
    const farthest = sortedByDistance.slice(-4); // ascending order of farthest
    const top100 = sortedByDistance.slice(0, 100);

    // sorting by size - sam
    const sortedBySize = [...asteroidsWithDistance].sort(
      (a, b) => a.averageDiameter - b.averageDiameter
    );
    const smallest = sortedBySize.slice(0, 4);
    const largest = sortedBySize.slice(-4).reverse(); // biggest first

    // Display list function
    const displayList = (list, headingText) => {
      const ul = document.getElementById("asteroid-list");
      const heading = document.getElementById("asteroid-heading");

      ul.innerHTML = "";
      heading.textContent = headingText;

      list.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${
          item.name
        } - ${item.distance.toLocaleString()} km - Speed: ${
          item.speed
          // added size info - sam
        } km/h - Size: ${item.averageDiameter.toFixed(2)} km`;
        li.classList.add("asteroid-item");


        li.addEventListener("click", (event) => {
          event.stopPropagation();
          const gapPercent = normalize(item.distance);
          document.getElementById(
            "asteroid-space"
          ).style.marginLeft = `${gapPercent}vw`;
          document.getElementById(
            "distance-display"
          ).textContent = `Distance from Earth: ${item.distance.toLocaleString()} km`;
        });

        ul.appendChild(li);
      });
    };

    // Initial view
    displayList(closest, "4 Closest Asteroids");

    // Reset asteroid on background click
    document.body.addEventListener("click", () => {
      document.getElementById("asteroid-space").style.marginLeft = `15vw`;
      document.getElementById("distance-display").textContent =
        "Click on an asteroid to see the distance";
    });

    // Filter buttons
    document.getElementById("filter-closest").addEventListener("click", () => {
      displayList(closest, "4 Closest Asteroids");
    });

    document.getElementById("filter-farthest").addEventListener("click", () => {
      displayList(farthest, "4 Farthest Asteroids");
    });

    document.getElementById("filter-top100").addEventListener("click", () => {
      displayList(top100, "Top 100 Asteroids (Closest to Farthest)");
    });

    document.getElementById("filter-smallest").addEventListener("click", () => {
      displayList(smallest, "Smallest Asteroids (Top 4)");
      console.log('Getting results (smallest)')
    });

    document.getElementById("filter-largest").addEventListener("click", () => {
      displayList(largest, "Largest Asteroids (Top 4)");
      console.log('Getting results (largest)');
    });

  })
  .catch((error) => console.error("Error fetching asteroid data:", error));
