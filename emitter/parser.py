from dataclasses import dataclass
from enum import Enum
from typing import Iterable, List, Dict, Any, Set, Optional


class EventType(Enum):
    APPEARED = 0
    TRANSFER = 1
    DISAPPEARED = 2


@dataclass
class Event:
    bike_id: int
    timestamp: float

    event_type: EventType
    place1_id: int
    place2_id: Optional[int]

    # For debug:
    place1_name: Optional[str]
    place2_name: Optional[str]

    @staticmethod
    def create_appeared(bike_id: int, timestamp: float, place_id: int, *args) -> 'Event':
        if len(args) > 0 and args[0] is not None:
            places = args[0]
            return Event(bike_id, timestamp, EventType.APPEARED, place_id, None, places[place_id], None)
        return Event(bike_id, timestamp, EventType.APPEARED, place_id, None, None, None)

    @staticmethod
    def create_transfer(bike_id: int, timestamp: float, source_place: int, target_place: int, *args) -> 'Event':
        if len(args) > 0 and args[0] is not None:
            places = args[0]
            return Event(bike_id, timestamp, EventType.TRANSFER, source_place, target_place, places[source_place], places[target_place])
        return Event(bike_id, timestamp, EventType.TRANSFER, source_place, target_place, None, None)

    @staticmethod
    def create_disappeared(bike_id: int, timestamp: float, place_id: int, *args) -> 'Event':
        if len(args) > 0 and args[0] is not None:
            places = args[0]
            return Event(bike_id, timestamp, EventType.DISAPPEARED, place_id, None, places[place_id], None)
        return Event(bike_id, timestamp, EventType.DISAPPEARED, place_id, None, None, None)


class State:
    def __init__(self):
        self.bikes: Dict[int, int] = {}

    def update_with_diff(self, timestamp: float, new_locations: Dict[int, int], places: Optional[Dict[int, str]]) -> List[Event]:
        events = []

        for bike, location in new_locations.items():
            if bike not in self.bikes:
                # New bike at new_location
                event = Event.create_appeared(bike, timestamp, location, places)
                events.append(event)
            elif self.bikes[bike] != location:
                # Bike present in both states, location changed
                event = Event.create_transfer(bike, timestamp, self.bikes[bike], location, places)
                events.append(event)

        for bike in self.bikes:
            if bike not in new_locations:
                # Bike no longer present
                event = Event.create_disappeared(bike, timestamp, self.bikes[bike], places)
                events.append(event)

        self.bikes = new_locations
        return events


class ResponseParser:
    def __init__(self, bike_ids: Iterable[int]):
        self.bike_ids: Set[int] = set(bike_ids)
        self.places: Dict[int, str] = {}

    def parse(self, api_data: List[Dict[str, Any]]):
        domain = list(filter(lambda item: item['domain'] == "vw", api_data))[0]
        cities = domain['cities']
        city = list(filter(lambda item: item['name'] == "Warszawa", cities))[0]
        places = city['places']

        new_state = {}
        for place in places:
            place_id = int(place['uid'])

            # For debug:
            place_name = place['name']
            if place_id not in self.places:
                self.places[place_id] = place_name

            for bike in place['bikes']:
                bike_id = int(bike['number'])
                # debug:
                # if bike_id in self.bike_ids:
                #     new_state[bike_id] = place_id
                new_state[bike_id] = place_id

        return new_state
