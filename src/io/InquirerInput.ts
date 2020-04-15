import Input, { Question } from './Input';
import inquirer from 'inquirer';

export default class InquirerInput implements Input {
  async confirm(message: string, defaultValue = true): Promise<boolean> {
    const { result } = await inquirer.prompt({
      name: 'result',
      type: 'confirm',
      message,
      default: defaultValue,
    });

    return result;
  }

  async prompt<T>(question: Question<T>): Promise<T> {
    const { message, filter, validate } = question;

    const { result } = await inquirer.prompt({
      name: 'result',
      message,
      default: question.default,
      filter,
      validate: validate && ((input: string): true | string => {
        const result = validate(input);

        return result.isOk() || result.error().message;
      }),
    });

    return result;
  }
}
