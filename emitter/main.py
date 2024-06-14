import logging
import os
import sys
import time

from typing import List, Dict, Any

import requests
import schedule

from parser import ResponseParser, State


_logger = None
_BIKE_IDS_FILE = os.environ.get('BIKE_IDS_FILE')
_VETURILO_API_URL = os.environ.get('VETURILO_API_URL')
# _SECONDS_DELAY = os.environ.get('SECONDS_DELAY')


def read_api() -> List[Dict[str, Any]]:
    response = requests.get(_VETURILO_API_URL)
    response.raise_for_status()
    json_response = response.json()
    response.close()
    return json_response


def job(extra_delay: int, response_parser: ResponseParser, state: State) -> None:
    time.sleep(extra_delay)

    error_msg = "Job failed"
    try:
        response_data = read_api()
    except requests.exceptions.HTTPError as errh:
        _logger.error(error_msg + ", Http Error:", errh)
        return
    except requests.exceptions.ConnectionError as errc:
        _logger.error(error_msg + ", Error Connecting:", errc)
        return
    except requests.exceptions.Timeout as errt:
        _logger.error(error_msg + ", Timeout Error:", errt)
        return
    except requests.exceptions.RequestException as err:
        _logger.error(error_msg + ": ", err)
        return

    timestamp = time.time()

    bike_locations = response_parser.parse(response_data)
    events = state.update_with_diff(timestamp, bike_locations, response_parser.places)

    if _logger.isEnabledFor(logging.INFO):
        for event in events:
            _logger.info(event)

    # TODO: Emit


def main(scheduler_delay: float):
    _logger.info('Starting emitter')
    print(os.listdir('.'), os.error)
    with open(_BIKE_IDS_FILE) as f:
        bike_ids = set(map(int, f.readlines()))

    _logger.info('Emitting info for %d bikes', len(bike_ids))

    response_parser = ResponseParser(bike_ids)
    state = State()

    seconds_delay = int(scheduler_delay)
    real_seconds_delay = str(seconds_delay % 60).rjust(2, '0')
    subsecond_delay = scheduler_delay - seconds_delay

    schedule.every().minute\
        .at(f":{real_seconds_delay}")\
        .do(job, subsecond_delay, response_parser, state)

    # schedule.every().second \
    #     .do(job, subsecond_delay, response_parser, state)

    while True:
        schedule.run_pending()
        time.sleep(schedule.idle_seconds())


if __name__ == "__main__":
    logging.basicConfig(
        filename='emitter.log',
        level=logging.INFO,
        format='%(asctime)s.%(msecs)03d %(levelname)-8s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    _logger = logging.getLogger(__name__)

    argv = sys.argv
    argc = len(argv)
    if argc != 2:
        print(f'Usage: python3 -m main <scheduler_delay_seconds>')
        exit(-2)

    seconds_delay = argv[1]
    # try:
    scheduler_delay = float(seconds_delay)
    # except ValueError:
    #     _logger.warning('Invalid scheduler delay provided in args, fallback to env var $SECONDS_DELAY')
    #     scheduler_delay = float(_SECONDS_DELAY)

    main(scheduler_delay)
