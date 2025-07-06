/**
 *
 * @param length - length of the unique string
 * @returns
 */
export function generateUniqueString(length = 12): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueString += characters[randomIndex];
  }

  return uniqueString;
}

import slugify from "slugify";
export function generateSlug(input: string): string {
  return slugify(input, {
    lower: true, // convert to lowercase
    strict: true, // remove special characters
    remove: /[*+~.()'"!:@]/g, // custom remove patterns (optional)
  });
}

/**
 * 将文本转换为URL友好的格式
 * - 中文转换为拼音，不带连字符
 * - 英文转换为小写，单词间用连字符连接
 */
export function slugifyText(text: string): string {
  if (!text) return '';

  // 检测是否包含中文字符
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);

  if (hasChinese) {
    // 使用 pinyin 处理中文
    // @ts-ignore - pinyin package is installed
    const pinyin = require('pinyin');
    return pinyin(text, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    }).flat().join('');
  } else {
    // 处理英文
    return text
      .toLowerCase() // 转小写
      .replace(/[^a-z0-9]+/g, '-') // 非字母数字替换为连字符
      .replace(/^-+|-+$/g, '') // 移除首尾连字符
      .replace(/[^\w-]+/g, '') // 移除其他特殊字符
  }
}
