import { Text } from '@/shared/ui/text';

type FormMessageProps = {
  message?: string;
};

// The error shown below a form field.
function FormMessage({ message }: FormMessageProps) {
  if (!message) return null;
  return (
    <Text variant="caption" className="text-destructive" accessibilityRole="alert">
      {message}
    </Text>
  );
}

export { FormMessage };
