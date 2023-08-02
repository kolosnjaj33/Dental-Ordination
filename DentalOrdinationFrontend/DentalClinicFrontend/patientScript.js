// Funkcija za slanje zahteva za kreiranje nove rezervacije
function createReservation(event) {
    event.preventDefault();

    const patientName = document.querySelector("#patientName").value;
    const phoneNumber = document.querySelector("#phoneNumberInput").value; 
    const durationInMinutes = document.querySelector("#durationInMinutes").value;
    const appointmentDate = document.querySelector("#appointmentDate").value;
    const appointmentTime = document.querySelector("#appointmentTime").value;

    // Provera da li je termin u okviru radnog vremena ordinacije (9-17h)
    const selectedTime = new Date(appointmentDate + "T" + appointmentTime);
    const openingTime = new Date(appointmentDate + "T09:00");
    const closingTime = new Date(appointmentDate + "T17:00");
    if (selectedTime < openingTime || selectedTime >= closingTime) {
        alert("Termin mora biti između 9:00 i 17:00");
        return;
    }

    checkExistingReservation(appointmentDate, appointmentTime)
        .then(reservationExists => {
            if (reservationExists) {
                alert("Termin je već rezervisan");
            } else {
                const reservationData = {
                    patientName: patientName,
                    durationInMinutes: durationInMinutes,
                    appointmentDate: appointmentDate,
                    appointmentTime: appointmentTime,
                    phoneNumber: phoneNumber 
                };

                fetch('http://localhost:8080/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reservationData)
                })
                    .then(response => response.json())
                    .then(newReservation => {
                        // Uspešno zakazano, prikaži poruku i resetuj formu
                        alert("Uspešno ste zakazali termin!");
                        document.querySelector("#createForm").reset();
                    })
                    .catch(error => console.error('Error:', error));
            }
        })
        .catch(error => console.error('Error:', error));

}

// Funkcija za proveru postojeće rezervacije za izabrani datum i vreme
function checkExistingReservation(appointmentDate, appointmentTime) {
    const selectedDateTime = new Date(appointmentDate + "T" + appointmentTime);
    return fetch('http://localhost:8080/api/reservations')
        .then(response => response.json())
        .then(reservations => {
            const conflictingReservation = reservations.find(reservation => {
                const reservationDateTime = new Date(reservation.appointmentDate + "T" + reservation.appointmentTime);
                return selectedDateTime.getTime() === reservationDateTime.getTime();
            });
            return !!conflictingReservation; // Vraćamo true ako postoji konfliktna rezervacija, inače false
        });
}


// Funkcija za slanje zahteva za otkazivanje rezervacije
function cancelReservation(reservationId) {
    fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
        method: 'DELETE'
    })
        .then(() => {
            refreshTable();
        })
        .catch(error => console.error('Error:', error));
}

// Funkcija za osvežavanje tabele sa rezervacijama
function refreshTable() {
    const phoneNumber = document.querySelector("#phoneNumber").value;
    fetch('http://localhost:8080/api/reservations')
        .then(response => response.json())
        .then(reservations => displayPatientReservations(reservations, phoneNumber))
        .catch(error => console.error('Error:', error));
}

// Funkcija za prikazivanje rezervacija pacijenta
function displayPatientReservations(reservations, phoneNumber) {
    const tableBody = document.getElementById("reservationBody");
    tableBody.innerHTML = "";

    reservations.forEach(reservation => {
        if (reservation.phoneNumber === phoneNumber) {
            const row = document.createElement("tr");

            const dateCell = document.createElement("td");
            dateCell.textContent = reservation.appointmentDate;
            row.appendChild(dateCell);

            const timeCell = document.createElement("td");
            timeCell.textContent = reservation.appointmentTime;
            row.appendChild(timeCell);

            const durationCell = document.createElement("td");
            durationCell.textContent = reservation.durationInMinutes + " min";
            row.appendChild(durationCell);

            const phoneNumberCell = document.createElement("td");
            phoneNumberCell.textContent = reservation.phoneNumber; // Prikaz broja telefona
            row.appendChild(phoneNumberCell);

            const cancelCell = document.createElement("td");
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Otkaži";
            cancelButton.addEventListener("click", () => cancelReservation(reservation.id));
            cancelCell.appendChild(cancelButton);
            row.appendChild(cancelCell);

            tableBody.appendChild(row);
        }
    });
}

// Funkcija za generisanje opcija u padajućem meniju za vreme
function generateTimeOptions() {
    const selectElement = document.getElementById("appointmentTime");
    selectElement.innerHTML = ""; // Praznimo padajući meni

    const openingTime = 9; 
    const closingTime = 17;

    for (let hour = openingTime; hour < closingTime; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            // Generišemo opcije za sate i minute u intervalima od 30 minuta
            let timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            let optionElement = document.createElement("option");
            optionElement.value = timeString;
            optionElement.textContent = timeString;
            selectElement.appendChild(optionElement);
        }
    }
}

// Pozivamo funkciju za generisanje opcija za vreme kada se učita stranica
generateTimeOptions();

// Event listener za submit forme za kreiranje rezervacije
document.querySelector("#createForm").addEventListener("submit", createReservation);

// Dodaj event listener za dugme "Prikaži moje termine"
document.querySelector("#showReservationsButton").addEventListener("click", () => {
    const phoneNumber = document.querySelector("#phoneNumber").value;
    refreshTable(phoneNumber);
});

// Prvo osveži tabelu sa rezervacijama
refreshTable();