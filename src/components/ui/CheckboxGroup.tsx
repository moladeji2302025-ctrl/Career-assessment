interface CheckboxGroupProps {
  id: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: 1 | 2 | 3;
}

export default function CheckboxGroup({
  id,
  options,
  selected,
  onChange,
  columns = 2,
}: CheckboxGroupProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div
      className={`checkbox-group checkbox-group--cols-${columns}`}
      role="group"
      aria-labelledby={`${id}-label`}
    >
      {options.map((option) => (
        <label key={option} className="checkbox-option">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
