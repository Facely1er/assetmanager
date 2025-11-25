import * as React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  title?: string;
  description?: string;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  className,
  variant = "default",
  title,
  description,
  showIcon = true,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-200",
    destructive: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-200",
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-200",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-200",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-200"
  };

  const iconMap = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info
  };

  const iconColors = {
    default: "text-gray-600 dark:text-gray-400",
    destructive: "text-red-600 dark:text-red-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400"
  };

  const IconComponent = iconMap[variant];

  return (
    <div
      className={`
        relative w-full rounded-lg border p-4
        ${variantStyles[variant]}
        ${className || ""}
      `}
      {...props}
    >
      <div className="flex items-start">
        {showIcon && (
          <IconComponent className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${iconColors[variant]}`} />
        )}
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

Alert.displayName = "Alert";

export { Alert };

