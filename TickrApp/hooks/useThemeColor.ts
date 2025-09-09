export function useThemeColor(
  props: { light?: string },
  colorName: string
) {
  return props.light ?? '#000'; // Always black text if not provided
}
