import yaml, { YAMLException } from 'js-yaml';
import Result from '../core/Result';
import Worklog from '../sync/Worklog';
import WorklogDuration from '../sync/WorklogDuration';
import WorklogMoment from '../sync/WorklogMoment';
import moment from 'moment';
import util from 'util';

type YamlValue = object | string | number | null | undefined;

interface DraftWorklog {
  issue: string;
  time: number;
  description: string;
}

interface DraftWorklogsByDate {
  [date: string]: DraftWorklog[];
}

function loadYamlDoc(text: string): Result<YamlValue, YAMLException> {
  try {
    return Result.ok(yaml.safeLoad(text, { schema: yaml.JSON_SCHEMA }));
  } catch (e) {
    return Result.err(e);
  }
}

function isSimpleObject(object: YamlValue): object is object & {} {
  return object !== null && typeof object === 'object' && !Array.isArray(object);
}

function expected(type: string, value: YamlValue): Error {
  return new Error(`expected ${type}, got: ${util.inspect(value)}`);
}

function parseDraftWorklogs(doc: YamlValue): Result<DraftWorklogsByDate> {
  if (!isSimpleObject(doc)) {
    return Result.err(new Error('expected object at top level'));
  }

  for (const [date, draftWorklogs] of Object.entries(doc)) {
    const parsedDate = moment(date, 'YYYY-MM-DD');

    if (!parsedDate.isValid()) {
      return Result.err(expected('valid date', date));
    }

    if (!Array.isArray(draftWorklogs)) {
      return Result.err(expected('array', draftWorklogs));
    }

    for (const draftWorklog of draftWorklogs) {
      if (!isSimpleObject(draftWorklog)) {
        return Result.err(expected('object', draftWorklog));
      }

      const { issue, time, description } = draftWorklog as { [key: string]: YamlValue };

      if (typeof issue !== 'string') {
        return Result.err(expected('string', issue));
      }

      if (typeof time !== 'number') {
        return Result.err(expected('number', time));
      }

      if (typeof description !== 'string') {
        return Result.err(expected('string', description));
      }
    }
  }

  return Result.ok(doc as DraftWorklogsByDate);
}

function createWorklog(date: string, draftWorklog: DraftWorklog): Result<Worklog> {
  const { issue, time, description } = draftWorklog;

  try {
    return Worklog.create({
      issueKey: issue,
      description,
      duration: WorklogDuration.fromHours(time).getOrThrow(),
      moment: WorklogMoment.fromDate(date).getOrThrow(),
    });
  } catch (e) {
    return Result.err(e as Error);
  }
}

export default class Parser {
  static parseWorklogs(text: string): Result<Worklog[]> {
    return loadYamlDoc(text)
      .then(parseDraftWorklogs)
      .then((draftWorklogsByDate: DraftWorklogsByDate) => {
        const worklogs = Object.entries(draftWorklogsByDate).flatMap(([date, draftWorklogs]) => (
          draftWorklogs.map((draftWorklog) => createWorklog(date, draftWorklog))
        ));

        try {
          return Result.ok(worklogs.map((worklog) => worklog.getOrThrow()));
        } catch (e) {
          return Result.err(e as Error);
        }
      });
  }
}
