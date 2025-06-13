document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Render activities with participants section
  async function renderActivities() {
    activitiesList.innerHTML = "<p>Loading activities...</p>";
    try {
      const res = await fetch("/activities");
      const activities = await res.json();
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      Object.entries(activities).forEach(([name, info]) => {
        const card = document.createElement("div");
        card.className = "activity-card";
        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${info.description}</p>
          <p><strong>Schedule:</strong> ${info.schedule}</p>
          <p><strong>Max Participants:</strong> ${info.max_participants}</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            <ul class="participants-list">
              ${info.participants.length === 0
                ? '<li class="no-participants">No participants yet</li>'
                : info.participants.map(email => `<li>${email}</li>`).join("")}
            </ul>
          </div>
        `;
        activitiesList.appendChild(card);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Signup failed");
      }

      messageDiv.textContent = "Signup successful!";
      messageDiv.className = "message success";
      signupForm.reset();
      await renderActivities(); // Refresh activities to show new participant
    } catch (error) {
      messageDiv.textContent = error.message;
      messageDiv.className = "message error";
    }

    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  });

  // Initialize app
  renderActivities();
});

