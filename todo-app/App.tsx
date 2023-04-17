import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_TODO_KEY = "@toDos";
const STORAGE_WORKING_KEY = "@isWorking";

export default function App() {
  const [working, setWorking] = useState(true);
  interface toDo {
    [key: string]: {
      text: string;
      work: boolean;
      isComplete: boolean;
    };
  }
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState<toDo>({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload: string) => setText(payload);
  const saveToDos = async (toSave: toDo) => {
    await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(toSave));
  };
  const saveIsWorking = async (toSave: boolean) => {
    await AsyncStorage.setItem(STORAGE_WORKING_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_TODO_KEY);
    if (!s) return;
    setToDos(JSON.parse(s));
  };
  const loadIsWorking = async () => {
    const s = await AsyncStorage.getItem(STORAGE_WORKING_KEY);
    if (!s) return;
    setWorking(JSON.parse(s));
  };
  useEffect(() => {
    loadToDos();
    loadIsWorking();
  }, []);
  useEffect(() => {
    saveIsWorking(working);
  }, [working]);
  const addToDo = async () => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, work: working, isComplete: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const completeToDos = async (key: string) => {
    const newToDos = { ...toDos };
    newToDos[key].isComplete = !newToDos[key].isComplete;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const deleteToDos = (key: string) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          returnKeyType="done"
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          onChangeText={onChangeText}
          value={text}
          style={styles.input}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].work === working ? (
            <View style={styles.toDo} key={key}>
              <TouchableOpacity onPress={() => completeToDos(key)}>
                <Fontisto
                  name={toDos[key].isComplete ? "checkbox-active" : "checkbox-passive"}
                  size={18}
                  color={theme.grey}
                />
              </TouchableOpacity>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDos(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
