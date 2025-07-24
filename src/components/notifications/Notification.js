export function showNotification(message, type = "success") {
  const notificationsContainer =
    document.getElementById("notifications") || createNotificationsContainer();

  const notification = document.createElement("div");
  notification.className = `p-3 text-white rounded shadow ${validateType(
    type
  )} transition transform duration-300 opacity-0 translate-y-2`;
  notification.textContent = message;

  notificationsContainer.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("opacity-0", "translate-y-2");
  }, 10);

  setTimeout(() => {
    notification.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createNotificationsContainer() {
  const container = document.createElement("div");
  container.id = "notifications";
  container.className = "fixed top-4 right-4 space-y-2 z-50";
  document.body.appendChild(container);
  return container;
}

function validateType(type) {
  let bgColor = "";
  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      break;
    case "error":
      bgColor = "bg-red-500";
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      break;
    case "info":
      bgColor = "bg-blue-500";
      break;

    default:
      bgColor = "bg-green-500";
      break;
  }
  return bgColor;
}
