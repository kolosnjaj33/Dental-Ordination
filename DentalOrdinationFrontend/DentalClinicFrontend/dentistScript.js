// Funkcija za prikaz svih rezervacija u tabeli
function displayReservations(reservations) {
    const tableBody = document.querySelector("#reservationTable tbody");
    tableBody.innerHTML = ""; // Obriši postojeće redove pre nego što dodamo nove

    reservations.forEach((reservation) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${reservation.id}</td>
            <td>${reservation.patientName}</td>
            <td>${reservation.durationInMinutes} min</td>
            <td>${reservation.appointmentDate}</td>
            <td>${getFormattedTime(reservation.appointmentTime, reservation.durationInMinutes)}</td>
            <td>${reservation.phoneNumber}</td>
            <td><button onclick="cancelReservation(${reservation.id})">Otkaži</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Funkcija za formatiranje vremena
function getFormattedTime(appointmentTime, durationInMinutes) {
    const [hours, minutes] = appointmentTime.split(":");
    const formattedHours = parseInt(hours);

    if (durationInMinutes === 30) {
        const halfHour = minutes < 30 ? "00" : "30";
        return `${formattedHours}:${halfHour}`;
    } else if (durationInMinutes === 60) {
        return `${formattedHours}:00`;
    } else {
        return appointmentTime;
    }
}

function cancelReservation(reservationId) {
    fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
        method: 'DELETE'
    })
        .then(() => {
            refreshTable();
        })
        .catch(error => console.error('Error:', error));
}

function refreshTable() {
    fetch('http://localhost:8080/api/reservations')
        .then(response => response.json())
        .then(reservations => displayReservations(reservations))
        .catch(error => console.error('Error:', error));
}


// Funkcija za slanje zahteva za kreiranje nove rezervacije
function createReservation(event) {
    event.preventDefault();

    const patientName = document.querySelector("#patientName").value;
    const durationInMinutes = document.querySelector("#durationInMinutes").value;
    const appointmentDate = document.querySelector("#appointmentDate").value;
    const appointmentTime = document.querySelector("#appointmentTime").value;
    const phoneNumber = document.querySelector("#phoneNumber").value;

    // Provera da li je termin u okviru radnog vremena ordinacije (9-17h)
    const selectedTime = new Date(appointmentDate + "T" + appointmentTime);
    const openingTime = new Date(appointmentDate + "T09:00");
    const closingTime = new Date(appointmentDate + "T17:00");
    if (selectedTime < openingTime || selectedTime >= closingTime) {
        alert("Termin mora biti između 9:00 i 17:00");
        return;
    }

    // Provera postojećih rezervacija za izabrani datum i vreme
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
                        // Dodaj novu rezervaciju u tabelu
                        const tableBody = document.querySelector("#reservationTable tbody");
                        const newRow = document.createElement("tr");
                        newRow.innerHTML = `
                        <td>${newReservation.id}</td>
                        <td>${newReservation.patientName}</td>
                        <td>${newReservation.durationInMinutes} min</td>
                        <td>${newReservation.appointmentDate}</td>
                        <td>${newReservation.appointmentTime}</td>
                        <td>${newReservation.phoneNumber}</td>
                        <td><button onclick="cancelReservation(${newReservation.id})">Otkaži</button></td>
                    `;
                        tableBody.appendChild(newRow);

                        // Resetuj formu za kreiranje rezervacije
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

// Event listener za submit forme za kreiranje rezervacije
document.querySelector("#createForm").addEventListener("submit", createReservation);

// Pri pokretanju aplikacije, učitaj sve rezervacije i prikaži ih u tabeli
fetch('http://localhost:8080/api/reservations')
    .then(response => response.json())
    .then(reservations => displayReservations(reservations))
    .catch(error => console.error('Error:', error));

// Funkcija za proveru koda za pristup kao zubar
function checkAccessCode() {
    const accessCode = document.querySelector("#accessCode").value;

    // Hardkodovani kod za pristup kao zubar (možete promeniti ovde)
    const hardcodedAccessCode = "zubar2023";

    if (accessCode === hardcodedAccessCode) {
        // Ako je kod tačan, pusti korisnika da pristupi kao zubar
        document.querySelector("#createForm").style.display = "block";
        document.querySelector("#reservationTable").style.display = "inline";
        document.querySelector("#h2first").style.display = "block";
        document.querySelector("#h2second").style.display = "block";
        document.querySelector("#accessCode").style.display = "none";
        document.querySelector("#accessButton").style.display = "none";
        document.querySelector(".accessClass").style.display = "none";

        alert("Dobrodošli! Sada pristupate kao zubar.");
    } else {
        // Ako je kod netačan, obavesti korisnika da nije autorizovan
        alert("Pogrešan kod za pristup. Nemate autorizaciju kao zubar.");
    }
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

// Event listener za dugme "Pristupi kao zubar"
document.querySelector("#accessButton").addEventListener("click", checkAccessCode);




