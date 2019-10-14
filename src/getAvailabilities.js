import moment from "moment";
import knex from "knexClient";

const generateAvailabilityMap = (date, numberOfDays) => {
  const availabilities = new Map();
  for (let i = 0; i < numberOfDays; ++i) {
    const tmpDate = moment(date).add(i, "days");
    availabilities.set(tmpDate.format("d"), {
      date: tmpDate.toDate(),
      slots: []
    });
  }
  return availabilities;
};

const fetchEventsForADay = date =>
  knex
    .select("kind", "starts_at", "ends_at", "weekly_recurring")
    .from("events")
    .where(function() {
      this.where("weekly_recurring", true).orWhere("ends_at", ">", +date);
    })
    .orderBy("kind", "desc");

const populateAvailableSlotsBaseOnEvents = (availabilities, events) => {
  for (const event of events) {
    for (
      let date = moment(event.starts_at);
      date.isBefore(event.ends_at);
      date.add(30, "minutes")
    ) {
      const day = availabilities.get(date.format("d"));
      if(!day) {
        return
      }
      if (event.kind === "opening") {
        day.slots.push(date.format("H:mm"));
      } else if (event.kind === "appointment") {
        day.slots = day.slots.filter(
          slot => slot.indexOf(date.format("H:mm")) === -1
        );
      }
    }
  }
};

export default async function getAvailabilities(date, numberOfDays= 7) {
  const availabilities = generateAvailabilityMap(date, numberOfDays);
  const events = await fetchEventsForADay(date);
  populateAvailableSlotsBaseOnEvents(availabilities, events);
  return Array.from(availabilities.values());
}
