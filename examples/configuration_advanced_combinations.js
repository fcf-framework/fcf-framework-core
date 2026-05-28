//
// This is solely for importing a module from the current directory.
const libPath = require('path');
const libModule = require("module");
let splitter    = process.platform == "win32" ? ";" : ":";
let paths       = !process.env.NODE_PATH ? [] : process.env.NODE_PATH.split(splitter);
paths.unshift(libPath.join(__dirname, '../..'));
process.env.NODE_PATH = paths.join(splitter);
libModule.Module._initPaths();

const fcf = require("fcf-framework-core");

/**
 * Пример 1: Прямая передача правил слияния (merge) без mergeParamNames.
 * Мы сразу говорим: "если видишь поле 'plugins', используй fcf.append".
 */
{
  fcf.log.log("APP", "--- Example 1: Direct 'merge' rules ---");

  const config = new fcf.Configuration({
    merge: {
      "plugins": "fcf.append",
      "metadata.tags": "fcf.append" // Можно указывать глубокие пути через точку
    }
  });

  config.append({
    plugins: ["auth"],
    metadata: { tags: ["v1"] }
  });

  config.append({
    plugins: ["logger"],
    metadata: { tags: ["stable"] }
  });

  fcf.log.log("APP", "Plugins:", config.plugins); 
  // ["auth", "logger"]
  fcf.log.log("APP", "Tags:", config.metadata.tags); 
  // ["v1", "stable"]
}

/**
 * Пример 2:  mergeParamNames.
 * mergeParamNames делает параметр "всегда слияемым", а merge позволяет 
 * выбрать конкретную функцию для этого параметра.
 */
{
  fcf.log.log("APP", "--- Example 2: mergeParamNames + merge ---");

  // Регистрируем кастомную функцию для примера
  (typeof global !== 'undefined' ? global : window).myCustomMerge = (a_curr, a_src) => {
    return (a_curr || "") + " | " + (a_src || "");
  };

  const config = new fcf.Configuration({
    mergeParamNames: ["ex_merge"],
  });

  config.append({
    ex_merge: {
      "version_string": "myCustomMerge",
    },
    version_string: "1.0" 
  });
  config.append({ version_string: "2.0" });

  fcf.log.log("APP", "Version:", config.version_string);
  // "1.0 | 2.0"
}

/**
 * Пример 3: Использование merge с внешним файлом (через property 'file').
 * Это демонстрирует, как fcf может автоматически загрузить файл, 
 * содержащий функцию слияния, если она не найдена в глобальной области.
 */
{
  fcf.log.log("APP", "--- Example 3: Merge via external file ---");

  const config = new fcf.Configuration({
    merge: {
      "counters": {
        function: "fcf.sumNumbers", 
        file: ":base-tests/functions/merge_helpers.js" // Путь в формате FCF
      }
    }
  });

  // Предположим, в файле выше определена функция fcf.sumNumbers
  // Для теста создадим её прямо здесь, чтобы пример был рабочим
  fcf.sumNumbers = (a_curr, a_src) => (a_curr || 0) + (a_src || 0);

  config.append({ counters: 10 });
  config.append({ counters: 5 });

  fcf.log.log("APP", "Counters:", config.counters);
  // 15
}

/**
 * Пример 4: Полная комбинация: enableDefaultParams + merge + mergeParamNames.
 * Самый мощный сценарий: берем дефолты фреймворка и накладываем свои правила слияния.
 */
{
  fcf.log.log("APP", "--- Example 4: Full Power (Defaults + Merge + ParamNames) ---");

  const config = new fcf.Configuration({
    enableDefaultParams: true, // Загружаем базовые настройки (aliases, translations и т.д.)
    mergeParamNames: ["aliases"], // Делаем aliases слияемым
    merge: {
      "aliases": "fcf.append" // Используем append для слияния алиасов
    }
  });

  // В дефолтах уже могут быть какие-то алиасы. Добавляем свои.
  config.append({
    aliases: {
      "my_app:home": "/index.html"
    }
  });

  config.append({
    aliases: {
      "my_app:about": "/about.html"
    }
  });

  fcf.log.log("APP", "Merged Aliases:", config.aliases);
  // Содержит и дефолтные, и наши новые алиасы
}
