export default class Parser {
  static parseFullName(fullName) {
    if (typeof fullName !== 'string' || !fullName) return [];

    const parts = fullName
      .trim()
      .replaceAll(/[ ]{2,}/g, ' ')
      .split(' ');

    if (!parts[0]) return [];
    if (parts.length === 1) return parts;
    if (parts.length >= 2) return [parts[0], parts[parts.length - 1]];
  }

  static isValidEmail(email) {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email?.toLowerCase()
    );
  }
}
