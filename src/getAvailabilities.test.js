import knex from "knexClient";
import getAvailabilities from "./getAvailabilities";

describe("getAvailabilities", () => {
  beforeEach(() => knex("events").truncate());

  describe("When there is no available time slots", () => {
    it("Should return empty for all the time slots", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities).toMatchObject([
        {slots: []},
        {slots: []},
        {slots: []},
        {slots: []},
        {slots: []},
        {slots: []},
        {slots: []}
      ])
    });
  });

  describe("When appointment slots and opening slots and are on same date on a week", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("should return all time slots in opening time slot", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("When appointment slots and opening slots and are on different date on a week", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-04 09:30"),
          ends_at: new Date("2018-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("should return all time slots in opening time slot", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[6].slots).toEqual([
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00"
      ]);
    });

    it("should return only number of days (5)", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"), 5);
      expect(availabilities.length).toBe(5);
    });
  });
});
