import { de } from "date-fns/locale";

class State {
    abbr: string;
    name: string;
    country: string;

    constructor(abbr: string, name: string, country: string) {
        this.abbr = abbr;
        this.name = name;
        this.country = country;
    }
}

let states = [
    new State("AL", "Alabama", "USA"),
    new State("AK", "Alaska", "USA"),
    new State("AZ", "Arizona", "USA"),
    new State("AR", "Arkansas", "USA"),
    new State("CA", "California", "USA"),
    new State("CO", "Colorado", "USA"),
    new State("CT", "Connecticut", "USA"),
    new State("DE", "Delaware", "USA"),
    new State("DC", "District Of Columbia", "USA"),
    new State("FL", "Florida", "USA"),
    new State("GA", "Georgia", "USA"),
    new State("HI", "Hawaii", "USA"),
    new State("ID", "Idaho", "USA"),
    new State("IL", "Illinois", "USA"),
    new State("IN", "Indiana", "USA"),
    new State("IA", "Iowa", "USA"),
    new State("KS", "Kansas", "USA"),
    new State("KY", "Kentucky", "USA"),
    new State("LA", "Louisiana", "USA"),
    new State("ME", "Maine", "USA"),
    new State("MD", "Maryland", "USA"),
    new State("MA", "Massachusetts", "USA"),
    new State("MI", "Michigan", "USA"),
    new State("MN", "Minnesota", "USA"),
    new State("MS", "Mississippi", "USA"),
    new State("MO", "Missouri", "USA"),
    new State("MT", "Montana", "USA"),
    new State("NE", "Nebraska", "USA"),
    new State("NV", "Nevada", "USA"),
    new State("NH", "New Hampshire", "USA"),
    new State("NJ", "New Jersey", "USA"),
    new State("NM", "New Mexico", "USA"),
    new State("NY", "New York", "USA"),
    new State("NC", "North Carolina", "USA"),
    new State("ND", "North Dakota", "USA"),
    new State("OH", "Ohio", "USA"),
    new State("OK", "Oklahoma", "USA"),
    new State("OR", "Oregon", "USA"),
    new State("PA", "Pennsylvania", "USA"),
    new State("RI", "Rhode Island", "USA"),
    new State("SC", "South Carolina", "USA"),
    new State("SD", "South Dakota", "USA"),
    new State("TN", "Tennessee", "USA"),
    new State("TX", "Texas", "USA"),
    new State("UT", "Utah", "USA"),
    new State("VT", "Vermont", "USA"),
    new State("VA", "Virginia", "USA"),
    new State("WA", "Washington", "USA"),
    new State("VI", "Virgin Islands", "USA"),
    new State("WV", "West Virginia", "USA"),
    new State("WI", "Wisconsin", "USA"),
    new State("WY", "Wyoming", "USA"),
    new State("AB", "Alberta", "CAN"),
    new State("BC", "British Columbia", "CAN"),
    new State("MB", "Manitoba", "CAN"),
    new State("NB", "New Brunswick", "CAN"),
    new State("NL", "Newfoundland and Labrador", "CAN"),
    new State("NT", "Northwest Territories", "CAN"),
    new State("NS", "Nova Scotia", "CAN"),
    new State("NU", "Nunavut", "CAN"),
    new State("ON", "Ontario", "CAN"),
    new State("PE", "Prince Edward Island", "CAN"),
    new State("QC", "Quebec", "CAN"),
    new State("SK", "Saskatchewan", "CAN"),
    new State("YT", "Yukon", "CAN")
];

let statesMap = new Map<string, State>();
states.forEach(state => statesMap.set(state.abbr, state));

export default statesMap;