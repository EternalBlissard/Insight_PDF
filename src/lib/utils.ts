import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToASCII(str: string) {
  // remove any non-ASCII characters
  str = str.replace(/[^\x00-\x7F]/g, "")
  return str
}