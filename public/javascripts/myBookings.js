
document.addEventListener("DOMContentLoaded", function() {
  const cancelButtons = document.querySelectorAll(".cancel-btn");

  cancelButtons.forEach(button => {
    button.addEventListener("click", async function() {
      const bookingId = this.dataset.id; // Get the booking ID from the button's data attribute
      try {
        const response = await fetch('/rideOpt/cancel-ride', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rideRequestId: bookingId }), // Send the booking ID in the request body
        });

        const result = await response.json();

        if (result.success) {
          alert("Booking cancelled successfully.");
          window.location.reload(); // Reload the page to update the bookings list
        } else {
          alert("Failed to cancel booking. Please try again.");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const confirmationButtons = document.querySelectorAll('.confirmation-btn');

  confirmationButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const rideRequestId = button.dataset.id;
      window.location.href = `/rideOpt/ride-confirmation/${rideRequestId}`;
    });
  });
});