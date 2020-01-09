import Input from './Input';
import inquirer from 'inquirer';

export default class InquirerInput implements Input {
  async confirmProceed(message: string): Promise<boolean> {
    const { proceed } = await inquirer.prompt({
      name: 'proceed',
      type: 'confirm',
      message,
    });

    return proceed;
  }
}
