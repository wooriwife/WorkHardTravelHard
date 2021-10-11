import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY_TODOS = "@toDos";
const STORAGE_KEY_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState();
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalKey, setModalKey] = useState();
  useEffect(() => {
    loadToDos();
    loadWorkingState();
    // const newToDos = { ...toDos };
    // delete newToDos[1633910239352];
    // setToDos(newToDos);
    // saveToDos(newToDos);
  }, []);

  useEffect(() => {
    if (working !== undefined) saveWorkingState();
  }, [working]);

  // useEffect(() => {

  // }, [modalToDoObj]);r
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeToDoText = (payload) => setText(payload);
  const onChangeModalText = (payload) => setModalText(payload);

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(toSave));
    } catch (e) {
      alert(e);
    }
  };
  const saveWorkingState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_WORKING, working.toString());
    } catch (e) {
      alert(e);
    }
  };
  const loadWorkingState = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
      if (s !== null) setWorking(s === "true");
    } catch (e) {
      alert(e);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY_TODOS);
      if (s !== null) setToDos(JSON.parse(s));
    } catch (e) {
      alert(e);
    }
  };
  const deleteTodos = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const addToDo = () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, completed: false, working },
    };
    // save to do
    setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
  };

  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    //console.log(newToDos[key].completed);
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const editTodos = (key) => {
    setModalKey(key);
    setModalText(toDos[key].text);
    setModalVisible(true);
  };

  const editTodoSubmit = () => {
    const newToDos = {
      ...toDos,
      [modalKey]: { ...toDos[modalKey], text: modalText },
    };
    console.log(newToDos);
    setToDos(newToDos);
    saveToDos(newToDos);
    setModalText("");
    setModalVisible(!modalVisible);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalInput}>
          <View style={styles.modalBox}>
            <TextInput
              autoCorrect={false}
              onChangeText={onChangeModalText}
              onSubmitEditing={editTodoSubmit}
              value={modalText}
              style={styles.modalTextBox}
            />
            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  setModalText("");
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.modalTBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtn}
                onPress={() => editTodoSubmit()}
              >
                <Text style={styles.modalTBtnText}>Edit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeToDoText}
          returnKeyType="done"
          value={text}
          placeholder={
            working ? "What do you have to do?" : "Where do you wanna go?"
          }
          style={styles.input}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <View flexDirection="row">
                <TouchableOpacity onPress={() => completeToDo(key)}>
                  <Fontisto
                    name={
                      toDos[key].completed
                        ? "checkbox-active"
                        : "checkbox-passive"
                    }
                    size={16}
                    color={toDos[key].completed ? theme.toDoBg : "white"}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].completed
                      ? "line-through"
                      : "none",
                    color: toDos[key].completed ? theme.toDoBg : "white",
                  }}
                >
                  {toDos[key].text}
                </Text>
              </View>
              <View flexDirection="row">
                <TouchableOpacity
                  style={{ paddingHorizontal: 10 }}
                  onPress={() => editTodos(key)}
                >
                  <Feather name="edit" size={16} color={theme.toDoBg} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ paddingHorizontal: 10 }}
                  onPress={() => deleteTodos(key)}
                >
                  <Fontisto name="trash" size={16} color={theme.toDoBg} />
                </TouchableOpacity>
              </View>
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
    justifyContent: "center",
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 32,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: theme.gray,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    paddingLeft: 20,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalInput: {
    flex: 1,
    color: "white",
    justifyContent: "center",
  },
  modalBox: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#646669",
  },
  modalTextBox: {
    backgroundColor: "white",
    fontSize: 16,
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    margin: 10,
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalBtn: {
    marginHorizontal: 10,
  },
  modalTBtnText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
});
