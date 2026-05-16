if ((typeof window !== undefined ? window : global).staticModuleValue){
  ++(typeof window !== undefined ? window : global).staticModuleValue;
} else {
  (typeof window !== undefined ? window : global).staticModuleValue = 1;
}


