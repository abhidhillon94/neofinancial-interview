const drawDatesService = require("../../../app/services/DrawDatesService");
const moment = require('moment');
const axios = require('axios');

describe('DrawDatesService', () => {

    describe('getter and setters of instance variables',  () => {

        it('should set DrawDateNumbersMap', () => {
            drawDatesService.setDrawDateNumbersMap({a: 'b'});
            expect(drawDatesService.drawDateNumbersMap).toEqual({a: 'b'});

            drawDatesService.setDrawDateNumbersMap(null);
        });

        it('should get DrawDateNumbersMap', () => {
            drawDatesService.setDrawDateNumbersMap({a: 'b'});
            expect(drawDatesService.getDrawDateNumbersMap()).toEqual({a: 'b'});
            drawDatesService.setDrawDateNumbersMap(null);
        });

        it('should set lastDrawDatesFetchTime', () => {
            drawDatesService.setLastDrawDatesFetchTime('x');
            expect(drawDatesService.lastDrawDatesFetchTime).toEqual('x');
            drawDatesService.setLastDrawDatesFetchTime(null);
        });

        it('should get lastDrawDatesFetchTime', () => {
            drawDatesService.setLastDrawDatesFetchTime('x');
            expect(drawDatesService.getLastDrawDatesFetchTime()).toEqual('x');
            drawDatesService.setLastDrawDatesFetchTime(null);
        });
    })

    describe('generateWhiteAndRedBallLookup',  () => {
        it('should return last number of input as redBall and remaning as whiteballs hashmap', () => {
            expect(drawDatesService.generateWhiteAndRedBallLookup('10 20 30 40 50 60')).toEqual({
                whiteBallsMap: {10: 1, 20: 1, 30: 1, 40: 1, 50: 1},
                redBall: 60,
            });
        });
    })

    describe('generateDrawDatesAndPicksHashMap', () => {

        it('should generate hashmap with key as date in YYYY-MM-DD format and ' +
            'value as result of generateWhiteAndRedBallLookup function',
        () => {
            generateWhiteAndRedBallLookupRes1 = {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 7};
            generateWhiteAndRedBallLookupRes2 = {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 9};

            jest.spyOn(drawDatesService, 'generateWhiteAndRedBallLookup')
                .mockReturnValueOnce(generateWhiteAndRedBallLookupRes1)
                .mockReturnValueOnce(generateWhiteAndRedBallLookupRes2);

            expect(drawDatesService.generateDrawDatesAndPicksHashMap(
                [
                    {"draw_date":"2021-05-15T00:00:00.000","winning_numbers":"04 10 37 39 69 24","multiplier":"3"},
                    {"draw_date":"2021-05-12T00:00:00.000","winning_numbers":"01 19 20 38 54 17","multiplier":"2"}
                ]
            )).toEqual({
                '2021-05-15': generateWhiteAndRedBallLookupRes1,
                '2021-05-12': generateWhiteAndRedBallLookupRes2,
            });

            expect(drawDatesService.generateWhiteAndRedBallLookup).toHaveBeenCalledTimes(2);

            drawDatesService.generateWhiteAndRedBallLookup.mockRestore();
        });
    })

    describe('isDrawDatesFetchRequired', () => {

        it('should get last saturday, wednesday, drawDatePickMap, lastDrawDatesFetchTime' +
            ' and return true if lastDrawDatesFetchTime is null',
        () => {
            jest.spyOn(drawDatesService, 'getLastOccuranceOfDayOfWeek').mockReturnValue(moment('2021-05-05'));
            jest.spyOn(drawDatesService, 'getDrawDateNumbersMap').mockReturnValue(null);
            jest.spyOn(drawDatesService, 'getLastDrawDatesFetchTime').mockReturnValue(null);

            const result = drawDatesService.isDrawDatesFetchRequired();

            expect(drawDatesService.getLastOccuranceOfDayOfWeek).toHaveBeenCalledTimes(2);
            expect(drawDatesService.getDrawDateNumbersMap).toHaveBeenCalledTimes(1);
            expect(drawDatesService.getLastDrawDatesFetchTime).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);

            drawDatesService.getLastOccuranceOfDayOfWeek.mockRestore();
            drawDatesService.getDrawDateNumbersMap.mockRestore();
            drawDatesService.getLastDrawDatesFetchTime.mockRestore();
        });

        it('should return true if drawDatePickMap is null and ' +
            'lastDrawDatesFetchTime is after last saturday and wednesday',
        () => {
            jest.spyOn(drawDatesService, 'getLastOccuranceOfDayOfWeek').mockReturnValue(moment('2021-05-05'));
            jest.spyOn(drawDatesService, 'getDrawDateNumbersMap').mockReturnValue(null);
            jest.spyOn(drawDatesService, 'getLastDrawDatesFetchTime').mockReturnValue(moment('2021-05-07'));

            const result = drawDatesService.isDrawDatesFetchRequired();

            expect(drawDatesService.getLastOccuranceOfDayOfWeek).toHaveBeenCalledTimes(2);
            expect(drawDatesService.getDrawDateNumbersMap).toHaveBeenCalledTimes(1);
            expect(drawDatesService.getLastDrawDatesFetchTime).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);

            drawDatesService.getLastOccuranceOfDayOfWeek.mockRestore();
            drawDatesService.getDrawDateNumbersMap.mockRestore();
            drawDatesService.getLastDrawDatesFetchTime.mockRestore();
        });

        it('should return true if drawDatePickMap doesn\'t contain last wednesday and ' +
            'lastDrawDatesFetchTime is after last saturday and wednesday',
        () => {
            jest.spyOn(drawDatesService, 'getLastOccuranceOfDayOfWeek').mockReturnValue(moment('2021-05-05'));
            jest.spyOn(drawDatesService, 'getDrawDateNumbersMap').mockReturnValue({
                '2021-05-15': {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 7},
            });
            jest.spyOn(drawDatesService, 'getLastDrawDatesFetchTime').mockReturnValue(moment('2021-05-07'));

            const result = drawDatesService.isDrawDatesFetchRequired();

            expect(drawDatesService.getLastOccuranceOfDayOfWeek).toHaveBeenCalledTimes(2);
            expect(drawDatesService.getDrawDateNumbersMap).toHaveBeenCalledTimes(1);
            expect(drawDatesService.getLastDrawDatesFetchTime).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);

            drawDatesService.getLastOccuranceOfDayOfWeek.mockRestore();
            drawDatesService.getDrawDateNumbersMap.mockRestore();
            drawDatesService.getLastDrawDatesFetchTime.mockRestore();
        });

        it('should return false if drawDatePickMap contains last wednesday and saturday',
        () => {
            jest.spyOn(drawDatesService, 'getLastOccuranceOfDayOfWeek')
                .mockReturnValueOnce(moment('2021-05-05'))
                .mockReturnValueOnce(moment('2021-05-08'));
            jest.spyOn(drawDatesService, 'getDrawDateNumbersMap').mockReturnValue({
                '2021-05-05': {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 7},
                '2021-05-08': {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 7},
            });
            jest.spyOn(drawDatesService, 'getLastDrawDatesFetchTime').mockReturnValue(moment('2021-05-09'));

            const result = drawDatesService.isDrawDatesFetchRequired();

            expect(drawDatesService.getLastOccuranceOfDayOfWeek).toHaveBeenCalledTimes(2);
            expect(drawDatesService.getDrawDateNumbersMap).toHaveBeenCalledTimes(1);
            expect(drawDatesService.getLastDrawDatesFetchTime).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);

            drawDatesService.getLastOccuranceOfDayOfWeek.mockRestore();
            drawDatesService.getDrawDateNumbersMap.mockRestore();
            drawDatesService.getLastDrawDatesFetchTime.mockRestore();
        });

        it('should return false if drawDatePickMap contains last wednesday but not saturday ' +
            'and lastDrawDatesFetchTime is 100 seconds ago and FETCH_RETRY_SECONDS is hardcoded as 300',
        () => {
            jest.spyOn(drawDatesService, 'getLastOccuranceOfDayOfWeek')
                .mockReturnValueOnce(moment('2021-05-05'))
                .mockReturnValueOnce(moment('2021-05-08'));
            jest.spyOn(drawDatesService, 'getDrawDateNumbersMap').mockReturnValue({
                '2021-05-05': {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 7},
            });
            jest.spyOn(drawDatesService, 'getLastDrawDatesFetchTime').mockReturnValue(
                moment().subtract(100, 'seconds')
            );

            const result = drawDatesService.isDrawDatesFetchRequired();

            expect(drawDatesService.getLastOccuranceOfDayOfWeek).toHaveBeenCalledTimes(2);
            expect(drawDatesService.getDrawDateNumbersMap).toHaveBeenCalledTimes(1);
            expect(drawDatesService.getLastDrawDatesFetchTime).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);

            drawDatesService.getLastOccuranceOfDayOfWeek.mockRestore();
            drawDatesService.getDrawDateNumbersMap.mockRestore();
            drawDatesService.getLastDrawDatesFetchTime.mockRestore();
        });
    });

    describe('getLastOccuranceOfDayOfWeek', () => {

        it(`should return moment start of day of input day occurance from previous week `+
            `if current day of week is lesser than input`,
        () => {
            jest.spyOn(Date, 'now').mockImplementation(() => new Date('2021-05-04T00:00:00.000Z')); // tuesday

            const result = drawDatesService.getLastOccuranceOfDayOfWeek(3); // 3 = wednesday
            expect(result.isSame(moment.utc('2021-04-28T00:00:00.000Z'))).toBe(true);

            Date.now.mockRestore();
        })

        it(`should return current day's start of day if current day of week is same as input argument`, () => {
            jest.spyOn(Date, 'now').mockImplementation(() => new Date('2021-05-05T00:00:00.000Z')); // wednesday

            const result = drawDatesService.getLastOccuranceOfDayOfWeek(3); // 3 = wednesday
            expect(result.isSame(moment.utc('2021-05-05T00:00:00.000Z'))).toBe(true);

            Date.now.mockRestore();
        });

        it(`should return moment start of day of input day occurance from same week `+
            `if current day of week is greater than input`,
        () => {
            jest.spyOn(Date, 'now').mockImplementation(() => new Date('2021-05-06T00:00:00.000Z')); // thursday

            const result = drawDatesService.getLastOccuranceOfDayOfWeek(3); // 3 = wednesday
            expect(result.isSame(moment.utc('2021-05-05T00:00:00.000Z'))).toBe(true);

            Date.now.mockRestore();
        });
    });

    describe('fetchDrawDatesFromPublicApi', () => {

        afterEach(() => axios.get.mockRestore());

        it('should fetch data from public url and return it if more than 1 record is found', async () => {

            const publicUrl = 'https://data.ny.gov/resource/d6yy-54nr.json';
            const drawDatesData = [
                {"draw_date":"2021-05-15T00:00:00.000","winning_numbers":"04 10 37 39 69 24","multiplier":"3"}
                ,{"draw_date":"2021-05-12T00:00:00.000","winning_numbers":"01 19 20 38 54 17","multiplier":"2"}
            ]
            jest.spyOn(axios, 'get').mockReturnValue(
                new Promise((res, rej) => res({data: drawDatesData, status: 200}))
            );

            const result = await drawDatesService.fetchDrawDatesFromPublicApi();

            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith(publicUrl);
            expect(result).toEqual(drawDatesData);
        });

        it('should log error and return blank array if response from public url is not an array', async () => {

            const drawDatesData = 'random string';
            jest.spyOn(axios, 'get').mockReturnValue(
                new Promise((res, rej) => res({data: drawDatesData, status: 200}))
            );
            jest.spyOn(console, 'error');

            const result = await drawDatesService.fetchDrawDatesFromPublicApi();

            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);

            console.error.mockRestore();
        });

        it('should log error and return blank array if calling public url fails', async () => {

            jest.spyOn(axios, 'get').mockReturnValue(
                new Promise((res, rej) => rej(new Error('failed')))
            );
            jest.spyOn(console, 'error');

            const result = await drawDatesService.fetchDrawDatesFromPublicApi();

            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);

            console.error.mockRestore();
        });
    });

    describe('refreshDrawDatesIfRequired', () => {

        it ('should fetch DrawDatesFrom Public Api and set LastDrawDatesFetchTime to current time ' +
            'if drawDates fetch is required',
        async () => {
            const currentMockTime = '2021-05-06T00:00:00.000Z';

            jest.spyOn(Date, 'now').mockImplementation(() => new Date(currentMockTime));
            jest.spyOn(drawDatesService, 'isDrawDatesFetchRequired').mockReturnValue(true);
            jest.spyOn(drawDatesService, 'setLastDrawDatesFetchTime').mockReturnValue();
            jest.spyOn(drawDatesService, 'fetchDrawDatesFromPublicApi').mockReturnValue([]);

            await drawDatesService.refreshDrawDatesIfRequired();

            expect(drawDatesService.setLastDrawDatesFetchTime.mock.calls[0][0].isSame(currentMockTime)).toBe(true);
            expect(drawDatesService.fetchDrawDatesFromPublicApi).toHaveBeenCalledTimes(1);
            
            Date.now.mockRestore();
            drawDatesService.isDrawDatesFetchRequired.mockRestore();
            drawDatesService.setLastDrawDatesFetchTime.mockRestore();
            drawDatesService.fetchDrawDatesFromPublicApi.mockRestore();
        });

        it ('should generate DrawDatesAndPicksHashMap using response of fetchDrawDatesFromPublicApi' +
            'if response contains more than 1 element in array and set DrawDateNumbersMap',
        async () => {
            const drawDatesFromPublicApi = [
                {"draw_date":"2021-05-15T00:00:00.000","winning_numbers":"04 10 37 39 69 24","multiplier":"3"}
                ,{"draw_date":"2021-05-12T00:00:00.000","winning_numbers":"01 19 20 38 54 17","multiplier":"2"}
            ];

            const drawDatesAndPickHashMap = {
                '2021-05-15' : {whiteBallsMap: {1: 1, 19: 1, 20: 1, 38: 1, 54: 1, 17: 1}, redBall: 7},
            }

            jest.spyOn(drawDatesService, 'isDrawDatesFetchRequired').mockReturnValue(true);
            jest.spyOn(drawDatesService, 'setLastDrawDatesFetchTime').mockReturnValue();
            jest.spyOn(drawDatesService, 'fetchDrawDatesFromPublicApi').mockReturnValue(drawDatesFromPublicApi);
            jest.spyOn(drawDatesService, 'generateDrawDatesAndPicksHashMap').mockReturnValue(drawDatesAndPickHashMap);
            jest.spyOn(drawDatesService, 'setDrawDateNumbersMap').mockReturnValue();

            await drawDatesService.refreshDrawDatesIfRequired();

            expect(drawDatesService.generateDrawDatesAndPicksHashMap).toHaveBeenCalledWith(drawDatesFromPublicApi);
            expect(drawDatesService.setDrawDateNumbersMap).toHaveBeenCalledWith(drawDatesAndPickHashMap);

            drawDatesService.isDrawDatesFetchRequired.mockRestore();
            drawDatesService.setLastDrawDatesFetchTime.mockRestore();
            drawDatesService.fetchDrawDatesFromPublicApi.mockRestore();
            drawDatesService.generateDrawDatesAndPicksHashMap.mockRestore();
            drawDatesService.setDrawDateNumbersMap.mockRestore();
        });

        it ('should not set lastDrawDatesFetchTime or fetch drawDates from public api if drawDates fetch is not required',
        async () => {
            jest.spyOn(drawDatesService, 'isDrawDatesFetchRequired').mockReturnValue(false);
            jest.spyOn(drawDatesService, 'setLastDrawDatesFetchTime').mockReturnValue();
            jest.spyOn(drawDatesService, 'fetchDrawDatesFromPublicApi');

            await drawDatesService.refreshDrawDatesIfRequired();

            expect(drawDatesService.setLastDrawDatesFetchTime).not.toHaveBeenCalled();
            expect(drawDatesService.fetchDrawDatesFromPublicApi).not.toHaveBeenCalled();

            drawDatesService.isDrawDatesFetchRequired.mockRestore();
            drawDatesService.setLastDrawDatesFetchTime.mockRestore();
            drawDatesService.fetchDrawDatesFromPublicApi.mockRestore();
        });
    });

    describe('getDrawDateAndNumbersMap', () => {
        
        it('should refresh drawDates if required and return drawDateNumbersMap', async () => {
            jest.spyOn(drawDatesService, 'refreshDrawDatesIfRequired').mockReturnValue(new Promise((res, rej) => res()));
            jest.spyOn(drawDatesService, 'getDrawDateNumbersMap').mockReturnValue();

            await drawDatesService.getDrawDateAndNumbersMap();
            
            expect(drawDatesService.refreshDrawDatesIfRequired).toHaveBeenCalledTimes(1);
            expect(drawDatesService.getDrawDateNumbersMap).toHaveBeenCalledTimes(1);

            drawDatesService.refreshDrawDatesIfRequired.mockRestore();
            drawDatesService.getDrawDateNumbersMap.mockRestore();
        })
    })

})
