import type { CareerCategory } from '../../data/organizationDepartments';

interface CategorizedCheckboxGroupProps {
  id: string;
  categories: CareerCategory[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function CategorizedCheckboxGroup({
  id,
  categories,
  selected,
  onChange,
}: CategorizedCheckboxGroupProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div
      className="categorized-checkbox-group"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      {categories.map((cat) => (
        <div key={cat.category} className="career-category">
          <h4 className="career-category__header">{cat.category}</h4>
          <div className="career-category__options">
            {cat.careers.map((career) => (
              <label key={career} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selected.includes(career)}
                  onChange={() => toggle(career)}
                />
                <span>{career}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
