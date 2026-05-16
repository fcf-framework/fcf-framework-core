fcf.test("Date tests", (a_unitest)=>{
  a_unitest.equal(fcf.parseDate("2021-12-21 21:21:12.123", "Y-m-d H:i:s.v").toISOString(), (new Date(2021,11,21,21,21,12,123)).toISOString());
  a_unitest.equal(fcf.parseDate("2021-12-21T21:21:12.123", "Y-m-d H:i:s.v", ).toISOString(), (new Date(2021,11,21,0,0,0,0)).toISOString());
  a_unitest.equal(fcf.parseDate("20211-12-21T21:21:12.123", "Y-m-d H:i:s.v", ).toISOString(), (new Date(2021,0,1,0,0,0,0)).toISOString());
  a_unitest.equal(isNaN(fcf.parseDate("a2021-12-21T21:21:12.123", "Y-m-d H:i:s.v", false).getTime()), isNaN((new Date("")).getTime()));
  a_unitest.equal(isNaN(fcf.parseDate("2021-12-21T21:21:12.123", "Y-m-d H:i:s.v", true).getTime()), isNaN((new Date("")).getTime()));
  a_unitest.equal(fcf.parseDate("2021-12-21T21:21:12.123", "Y-m-d*H:i:s.v").toISOString(), (new Date(2021,11,21,21,21,12,123)).toISOString());
  a_unitest.equal(fcf.parseDate("2021-12-21Y21:21:12.123", "Y-m-d\\YH:i:s.v").toISOString(), (new Date(2021,11,21,21,21,12,123)).toISOString());
  a_unitest.equal((new Date("2021-12-21T21:21:12.123Z")).toISOString().substr(0, 23), fcf.formatDate("2021-12-21 21:21:12.123Z", "Y-m-dTH:i:s.v", false));
  a_unitest.equal((new Date("2021-12-21T21:21:12.123Z")).toISOString().substr(0, 23)+"Y", fcf.formatDate("2021-12-21 21:21:12.123Z", "Y-m-dTH:i:s.v\\Y", false));

  // {
  //   let date = fcf.formatDate("1971-02-01T09:01:01");
  //   console.log(date);
  // }


})
