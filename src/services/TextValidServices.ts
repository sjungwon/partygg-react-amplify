export default class TextValidServices {
  public static isLongerThanNumber(text: string, length: number): boolean {
    if (text.length < length) {
      return false;
    }

    return true;
  }

  public static isShorterThanNumber(text: string, length: number): boolean {
    if (text.length > length) {
      return false;
    }

    return true;
  }

  public static isIncludeAlphabet(text: string): boolean {
    return new RegExp(/\D/g).test(text);
  }

  public static isIncludeNumber(text: string): boolean {
    return new RegExp(/\d/g).test(text);
  }

  public static isEmailType(text: string): boolean {
    return new RegExp(
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
    ).test(text);
  }

  public static isIncludeSpecial(text: string): boolean {
    return new RegExp(/[{}[\]/?.,;:|)*~`!^\-_+<>@#₩$%&\\=('"]/g).test(text);
  }

  public static isIncludePathSpecial(text: string): boolean {
    return new RegExp(/[!*`';:@&=+$,/?\\#[\]()]/g).test(text);
  }

  public static removeSpecial(text: string): string {
    const reg = /[{}[\]/?.,;:|)*~`!^\-_+<>@#₩$%&\\=('"]/g;
    return text.replace(reg, "");
  }
}
